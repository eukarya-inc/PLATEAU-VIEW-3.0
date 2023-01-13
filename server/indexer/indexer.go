package indexer

import (
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/qmuntal/draco-go/gltf/draco"
	"github.com/qmuntal/gltf"
	b3dms "github.com/reearth/go3dtiles/b3dm"
	tiles "github.com/reearth/go3dtiles/tileset"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
	"gonum.org/v1/gonum/mat"
)

type Indexer struct{}

func NewIndexer() *Indexer {
	return &Indexer{}
}

type Fs interface {
	Open(string) (io.ReadCloser, error)
}

type ResultData []map[string]string

func (indexer *Indexer) GenerateIndexes(config *Config, tilesetPath string, fsys Fs) (resultData ResultData, errMsg error) {
	var indexBuilders []IndexBuilder
	basePath := strings.Split(tilesetPath, "tileset.json")[0]
	ts, err := fsys.Open(tilesetPath)

	defer func() {
		_ = ts.Close()
	}()

	if err != nil {
		errMsg = fmt.Errorf("failed to open the tileset: %w", err)
		return
	}
	reader := tiles.NewTilsetReader(ts)
	tileset := new(tiles.Tileset)
	if err := reader.Decode(tileset); err != nil {
		errMsg = fmt.Errorf("failed to decode the tileset: %w", err)
		return
	}

	for property, config := range config.Indexes {
		indexBuilders = append(indexBuilders, createIndexBuilder(property, config))
	}

	features, err := ReadTilesetFeatures(tileset, config, basePath, fsys)
	if err != nil {
		errMsg = fmt.Errorf("failed to read features: %w", err)
		return
	}

	featureCount := len(features)
	log.Debugln("Number of features counted: ", featureCount)

	for idValue, tilsetFeature := range features {
		// taking all positionProperties map entries as string for better writing experience
		positionProperties := map[string]string{
			config.IdProperty: idValue,
			"Longitude":       strconv.FormatFloat(roundFloat(toDegrees(tilsetFeature.Position.Longitude), 5), 'g', -1, 64),
			"Latitude":        strconv.FormatFloat(roundFloat(toDegrees(tilsetFeature.Position.Latitude), 5), 'g', -1, 64),
			"Height":          strconv.FormatFloat(roundFloat(tilsetFeature.Position.Height, 3), 'g', -1, 64),
		}
		resultData = append(resultData, positionProperties)
		length := len(resultData)
		dataRowId := length - 1
		for _, b := range indexBuilders {
			switch t := b.(type) {
			case EnumIndexBuilder:
				if val, ok := tilsetFeature.Properties[t.Property]; ok && val != nil {
					t.AddIndexValue(dataRowId, val.(string))
				}
			default:
				continue
			}
		}
	}

	return
}

type TilesetFeature struct {
	Properties map[string]interface{}
	Position   Cartographic
}

func ReadTilesetFeatures(ts *tiles.Tileset, config *Config, basePath string, fsys Fs) (map[string]TilesetFeature, error) {
	uniqueFeatures := make(map[string]TilesetFeature)
	tilesetQueue := []*tiles.Tileset{ts}

	for _, tileset := range tilesetQueue {
		tilesetIterFn := func(tile *tiles.Tile, computedTransform *mat.Dense) error {
			tileUri, err := tile.Uri()
			if err != nil {
				return fmt.Errorf("failed to fetch uri of tile: %v", err)
			}

			contentPath := filepath.Join(basePath, tileUri)
			log.Debugln(tileUri)
			if strings.HasSuffix(tileUri, ".json") {
				childTileset, _ := tiles.Open(tileUri)
				tilesetQueue = append(tilesetQueue, childTileset)
				return nil
			}

			b3dmFile, err := fsys.Open(contentPath)
			if err != nil {
				return fmt.Errorf("failed to open b3dm file: %v", err)
			}

			defer func() {
				_ = b3dmFile.Close()
			}()

			reader := b3dms.NewB3dmReader(b3dmFile)
			b3dm := new(b3dms.B3dm)
			if err := reader.Decode(b3dm); err != nil {
				return err
			}
			featureTable := b3dm.GetFeatureTable()
			batchLength := featureTable.GetBatchLength()
			featureTableView := b3dm.GetFeatureTableView()
			batchTable := b3dm.GetBatchTable()
			batchTableProperties := batchTable.Data
			computedFeaturePositions := []Cartographic{}
			doc := b3dm.GetModel()
			if doc != nil {
				rtcTransform, err := getRtcTransform(featureTableView, doc)
				if err != nil {
					return fmt.Errorf("failed to getRtcTransform: %v", err)
				}
				toZUpTransform := getZUpTransform()
				computedFeaturePositions, err = computeFeaturePositionsFromGltfVertices(
					doc,
					computedTransform,
					rtcTransform,
					toZUpTransform,
					batchLength,
				)
				if err != nil {
					return fmt.Errorf("failed to open b3dm file: %v", err)
				}
			}

			for batchId := 0; batchId < batchLength; batchId++ {
				batchProperties := make(map[string]interface{})
				for name, values := range batchTableProperties {
					batchProperties[name] = nil
					if len(values) > 0 {
						batchProperties[name] = values[batchId]
					}
				}
				position := computedFeaturePositions[batchId]
				idValue := batchProperties[config.IdProperty].(string)
				uniqueFeatures[idValue] = TilesetFeature{
					Position:   position,
					Properties: batchProperties,
				}
			}

			return nil
		}

		if err := ForEachTile(tileset, tilesetIterFn); err != nil {
			return nil, fmt.Errorf("something went wrong at iterTile: %v", err)
		}
	}

	return uniqueFeatures, nil
}

func computeFeaturePositionsFromGltfVertices(doc *gltf.Document, tileTransform, rtcTransform, toZUpTransform *mat.Dense, batchLength int) ([]Cartographic, error) {
	nodes := doc.Nodes
	if nodes == nil {
		return nil, errors.New("nodes are nil")
	}
	meshes := doc.Meshes
	if meshes == nil {
		return nil, errors.New("meshes are nil")
	}
	accessors := doc.Accessors
	if accessors == nil {
		return nil, errors.New("accesors are nil")
	}

	batchIdPositions := make([][]Cartographic, batchLength)

	extensionsUsed := doc.ExtensionsUsed
	dracoCompressionUsed := slices.Contains(extensionsUsed, draco.ExtensionName)

	for _, node := range nodes {
		mesh := meshes[*node.Mesh]
		primitives := mesh.Primitives
		nodeMatrix := eyeMat(4)
		if len(node.Matrix) > 0 {
			nodeMatrix = mat4FromGltfNodeMatrix(node.Matrix)
		}

		modelMatrix := eyeMat(4)
		modelMatrix = mat4MultiplyTransformation(modelMatrix, tileTransform)
		modelMatrix = mat4MultiplyTransformation(modelMatrix, rtcTransform)
		modelMatrix = mat4MultiplyTransformation(modelMatrix, toZUpTransform)
		modelMatrix = mat4MultiplyTransformation(modelMatrix, nodeMatrix)

		for _, primitive := range primitives {
			var batchIds []uint16
			var positions [][3]float32

			if dracoCompressionUsed {
				primitiveExt := primitive.Extensions[draco.ExtensionName].(*draco.PrimitiveExt)
				pd, err := draco.UnmarshalMesh(doc, doc.BufferViews[primitiveExt.BufferView])
				if err != nil {
					return nil, fmt.Errorf("error while unmarshalling mesh: %v", err)
				}
				bi, _ := pd.ReadAttr(primitive, "_BATCHID", nil)
				if err != nil {
					return nil, fmt.Errorf("failed to read batchIds: %v", err)
				}
				pos, err := pd.ReadAttr(primitive, "POSITION", nil)
				if err != nil {
					return nil, fmt.Errorf("failed to read Positions: %v", err)
				}
				positions = pos.([][3]float32)

				for _, batch := range bi.([]uint8) {
					batchIds = append(batchIds, uint16(batch))
				}

			} else {
				bi, err := b3dms.GetGltfAttribute(primitive, doc, "_BATCHID")
				if err != nil {
					return nil, fmt.Errorf("failed to read batchIds: %v", err)
				}
				pos, err := b3dms.GetGltfAttribute(primitive, doc, "POSITION")
				if err != nil {
					return nil, fmt.Errorf("failed to read Positions: %v", err)
				}

				for _, ps := range pos {
					var temp [3]float32
					for i, x := range ps.([]interface{}) {
						temp[i] = x.(float32)
					}
					positions = append(positions, temp)
				}

				for _, bit := range bi {
					for _, x := range bit.([]interface{}) {
						v, _ := getInt(x)
						batchIds = append(batchIds, uint16(v))
					}
				}
			}

			for i, pointFloat32Array := range positions {
				points, err := util.TryMap(pointFloat32Array[:], getFloat)
				if err != nil {
					return nil, fmt.Errorf("map failed: %w", err)
				}
				localPosition := cartesianFromSlice(points)
				worldPosition := multiplyMat4ByPoint(modelMatrix, localPosition)
				cartographic, err := cartographicFromCartesian3(worldPosition)
				if err != nil {
					return nil, fmt.Errorf("failed to convert cartesian to cartographic: %w", err)
				}
				if batchIdPositions[batchIds[i]] == nil {
					batchIdPositions[batchIds[i]] = []Cartographic{}
				}

				if cartographic != nil {
					batchIdPositions[batchIds[i]] = append(batchIdPositions[batchIds[i]], *cartographic)
				}
			}
		}
	}

	featurePositions := []Cartographic{}

	for _, positions := range batchIdPositions {
		height := []float64{}
		for _, carto := range positions {
			height = append(height, carto.Height)
		}
		minHeight, maxHeight := minMaxOfSlice(height)
		featureHeight := maxHeight - minHeight
		rectangle := rectangleFromCartographicArray(positions)
		position := rectangle.center()
		position.Height = featureHeight

		featurePositions = append(featurePositions, *position)
	}

	return featurePositions, nil
}

type TileIterFn func(*tiles.Tile, *mat.Dense) error

func ForEachTile(ts *tiles.Tileset, iterFn func(tile *tiles.Tile, computedTransform *mat.Dense) error) error {
	root := &ts.Root

	var iterTile TileIterFn
	iterTile = func(tile *tiles.Tile, parentTransform *mat.Dense) error {
		computedTransform := parentTransform
		if tile.Transform != nil {
			test := tile.Transform[:]
			computedTransform.Mul(parentTransform, mat.NewDense(4, 4, test))
		}
		err := iterFn(tile, computedTransform)
		if err != nil {
			return fmt.Errorf("something wrong at iterFn: %v", err)
		}
		if (tile.Children != nil) && len(*tile.Children) != 0 {
			for _, child := range *tile.Children {
				err = iterTile(&child, computedTransform)
				if err != nil {
					return fmt.Errorf("something went wrong at iterTile: %v", err)
				}
			}
		}
		return nil
	}

	err := iterTile(root, eyeMat(4))
	if err != nil {
		return fmt.Errorf("something went wrong at iterTile: %v", err)
	}

	return nil
}

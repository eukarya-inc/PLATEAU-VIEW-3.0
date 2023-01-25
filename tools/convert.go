package main

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"image/color"
	"io"
	"net/http"
	"os"
	"path"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/tdewolff/canvas"
	"github.com/tdewolff/canvas/renderers"
	"github.com/vincent-petithory/dataurl"
)

const (
	wallHeight           = 100
	wallImageName        = "yellow_gradient.png"
	billboardImageDir    = "billboard_image"
	billboardPaddingH    = 16.0
	billboardPaddingV    = 8.0
	billboradFontSize    = 72.0
	billboardRadius      = 30.0
	billboardLineWidth   = 2.0
	billboardLineHeight  = 100.0
	billbordHeightMargin = 55.0
)

var (
	//go:embed yellow_gradient.png
	wallImage        []byte
	wallImageDataURL = dataurl.New(wallImage, http.DetectContentType(wallImage)).String()

	billboardBgColor   = color.RGBA{R: 0, G: 189, B: 189, A: 255} // #00BDBD
	billboardTextColor = color.White

	//go:embed fonts/NotoSansJP-Light.otf
	billboardFontData   []byte
	billboardFontFamily = canvas.NewFontFamily("Noto Sans Japanese")
	billboardFontStyle  = canvas.FontLight
)

func init() {
	billboardFontFamily.MustLoadFont(billboardFontData, 0, billboardFontStyle)
}

type Convert struct {
	Input    string   `help:"入力元ディレクトリパス。デフォルトはカレントディレクトリです。"`
	Output   string   `help:"出力先ディレクトリパス。デフォルトはカレントディレクトリです。"`
	InputFS  afero.Fs `opts:"-"`
	OutputFS afero.Fs `opts:"-"`
	Copy     bool     `help:"CZML生成対象外のGeoJSONをそのまま出力先にコピーします。デフォルトではコピーしません。"`
}

func (c *Convert) Execute() error {
	c.InputFS = afero.NewBasePathFs(afero.NewOsFs(), c.Input)
	if c.Output == "" || path.Clean(c.Output) == "." {
		c.OutputFS = afero.NewOsFs()
	} else {
		c.OutputFS = afero.NewBasePathFs(afero.NewOsFs(), c.Output)
	}
	return c.execute()
}

func (c *Convert) execute() error {
	files, err := afero.ReadDir(c.InputFS, "")
	if err != nil {
		return fmt.Errorf("ディレクトリの読み込みに失敗しました。%w", err)
	}

	for _, fi := range files {
		if fi.IsDir() {
			continue
		}

		name := fi.Name()
		if path.Ext(name) != ".geojson" {
			continue
		}

		t := detectType(name)
		if t == "" {
			if c.Copy {
				os.Stderr.WriteString(fmt.Sprintf("copy: %s\n", name))
				if err := c.copyFile(name); err != nil {
					return fmt.Errorf("「%s」のコピーに失敗しました。%w", name, err)
				}
			}
			continue
		}

		fc, err := c.loadGeoJSON(name)
		if err != nil {
			return fmt.Errorf("GeoJSONファイル「%s」の読み込みに失敗しました。%w", name, err)
		}

		id := strings.TrimSuffix(name, path.Ext(name))
		var czml any
		switch t {
		case "landmark":
			os.Stderr.WriteString(fmt.Sprintf("land: %s\n", name))
			czml, err = ConvertLandmark(fc, id)
		case "border":
			os.Stderr.WriteString(fmt.Sprintf("bord: %s\n", name))
			czml, err = ConvertBorder(fc, id)
		}

		if err != nil {
			return fmt.Errorf("CZMLデータの生成に失敗しました。%w", err)
		}
		if czml == nil {
			continue
		}

		if err := c.writeCZML(id, czml); err != nil {
			return fmt.Errorf("CZMLファイルの書き込みに失敗しました。%w", err)
		}
	}

	return nil
}

func (c *Convert) copyFile(name string) error {
	f, err := c.InputFS.Open(name)
	if err != nil {
		return err
	}
	defer func() {
		_ = f.Close()
	}()

	f2, err := c.OutputFS.Create(name)
	if err != nil {
		return err
	}
	defer func() {
		_ = f2.Close()
	}()

	_, err = io.Copy(f2, f)
	return err
}

func (c *Convert) loadGeoJSON(path string) (*geojson.FeatureCollection, error) {
	f, err := c.InputFS.Open(path)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = f.Close()
	}()

	fc := &geojson.FeatureCollection{}
	if err := json.NewDecoder(f).Decode(&fc); err != nil {
		return fc, err
	}
	return fc, nil
}

func (c *Convert) writeCZML(name string, d any) error {
	f, err := c.OutputFS.Create(name + ".czml")
	if err != nil {
		return err
	}

	defer func() {
		_ = f.Close()
	}()

	return json.NewEncoder(f).Encode(d)
}

func detectType(name string) string {
	fn := strings.TrimSuffix(name, path.Ext(name))
	if strings.HasSuffix(fn, "_landmark") || strings.HasSuffix(fn, "_station") {
		return "landmark"
	} else if strings.HasSuffix(fn, "_border") {
		return "border"
	}
	return ""
}

// ConvertLandmark は国土数値情報を基に作成されたランドマーク・鉄道駅GeoJSONデータをPLATEAU VIEW用のCZMLに変換します。
func ConvertLandmark(fc *geojson.FeatureCollection, id string) (any, error) {
	packets := make([]any, 0, len(fc.Features))
	for i, f := range fc.Features {
		if len(f.Geometry.Point) < 2 {
			continue
		}

		name, _ := f.PropertyString("名称")
		if name == "" {
			name, _ = f.PropertyString("駅名")
		}
		if name == "" {
			continue
		}

		height, _ := f.PropertyFloat64("高さ")
		if len(f.Geometry.Point) == 2 {
			f.Geometry.Point = append(f.Geometry.Point, height+billbordHeightMargin)
		} else if height > 0 {
			f.Geometry.Point[2] = height + billbordHeightMargin
		}

		image, err := GenerateLandmarkImage(name)
		if err != nil {
			return nil, err
		}

		packets = append(packets, map[string]any{
			"id":          fmt.Sprintf("%s_%d", id, i),
			"name":        name,
			"description": name,
			"billboard": map[string]any{
				"eyeOffset": map[string]any{
					"cartesian": []int{0, 0, 0},
				},
				"horizontalOrigin": "CENTER",
				"image":            dataurl.New(image, http.DetectContentType(image)).String(),
				"pixelOffset": map[string]any{
					"cartesian2": []int{0, 0},
				},
				"scale":          0.5,
				"show":           true,
				"verticalOrigin": "BOTTOM",
				"sizeInMeters":   true,
			},
			"position": map[string]any{
				"cartographicDegrees": f.Geometry.Point,
			},
			"properties": f.Properties,
		})
	}

	return czml(id, packets...), nil
}

// GenerateLandmarkImage はランドマーク用の画像を生成します。
func GenerateLandmarkImage(name string) ([]byte, error) {
	face := billboardFontFamily.Face(billboradFontSize, billboardTextColor, billboardFontStyle, canvas.FontNormal)
	text := canvas.NewTextLine(face, name, canvas.Left)
	textBounds := text.Bounds()
	text2 := canvas.NewTextBox(face, name, textBounds.W+billboardPaddingH*2, textBounds.H+billboardPaddingV*2, canvas.Center, canvas.Middle, 0, 0)

	w := textBounds.W + billboardPaddingH*2
	h := textBounds.H + billboardPaddingV*2 + billboardLineHeight
	c := canvas.New(w, h)
	ctx := canvas.NewContext(c)
	ctx.SetCoordSystem(canvas.CartesianIV)

	ctx.SetStrokeWidth(0)
	ctx.SetFillColor(billboardBgColor)
	ctx.DrawPath(0, 0, canvas.RoundedRectangle(w, textBounds.H+billboardPaddingV*2, billboardRadius))

	ctx.SetStrokeWidth(billboardLineWidth)
	ctx.SetStrokeColor(billboardBgColor)
	ctx.DrawPath(w/2, textBounds.H+billboardPaddingV*2, canvas.Line(0, h-textBounds.H+billboardPaddingV*2))

	ctx.DrawText(0, 0, text2)

	b := bytes.NewBuffer(nil)
	if err := renderers.PNG()(b, c); err != nil {
		return nil, err
	}
	return b.Bytes(), nil
}

// ConvertBorder は国土数値情報を基に作成された行政界GeoJSONデータをPLATEAU VIEW用のCZMLに変換します。
func ConvertBorder(fc *geojson.FeatureCollection, id string) (any, error) {
	packets := make([]any, 0, len(fc.Features))
	for i, f := range fc.Features {
		if len(f.Geometry.Polygon) == 0 || len(f.Geometry.Polygon[0]) == 0 {
			continue
		}

		positions := lo.FlatMap(f.Geometry.Polygon[0], func(p []float64, _ int) []float64 {
			if len(p) < 2 {
				return nil
			}
			return []float64{p[0], p[1], wallHeight}
		})

		packets = append(packets, map[string]any{
			"id": fmt.Sprintf("%s_%d", id, i+1),
			"wall": map[string]any{
				"material": map[string]any{
					"image": map[string]any{
						"image":       wallImageDataURL,
						"repeat":      true,
						"transparent": true,
					},
				},
				"positions": map[string]any{
					"cartographicDegrees": positions,
				},
			},
			"properties": f.Properties,
		})
	}

	return czml(id, packets...), nil
}

func czml(name string, packets ...any) any {
	return append(
		[]any{
			map[string]any{
				"id":      "document",
				"name":    name,
				"version": "1.0",
			},
		},
		packets...,
	)
}

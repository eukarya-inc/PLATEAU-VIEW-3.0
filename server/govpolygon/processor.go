package govpolygon

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearthx/log"
	"github.com/rubenv/topojson"
	simplify "github.com/yrsh/simplify-go"
)

type Processor struct {
	dirpath           string
	key1              string
	key2              string
	simplifyTolerance float64
}

func NewProcessor(dirpath, key1, key2 string, simplifyTolerance float64) *Processor {
	return &Processor{dirpath: dirpath, key1: key1, key2: key2}
}

func (p *Processor) ComputeGeoJSON(ctx context.Context, values []string, citycodem map[string]string) (*geojson.FeatureCollection, []string, error) {
	features, err := loadFeatures(context.Background(), p.dirpath, p.simplifyTolerance)
	if err != nil {
		return nil, nil, err
	}

	if len(features) == 0 {
		return nil, nil, fmt.Errorf("no features found")
	}

	res, notfound := computeGeojsonFeatures(features, p.key1, p.key2, values, citycodem)
	return res, notfound, nil
}

func computeGeojsonFeatures(features []*geojson.Feature, key1, key2 string, values []string, citycodem map[string]string) (*geojson.FeatureCollection, []string) {
	valueSet := map[string]struct{}{}
	for _, v := range values {
		valueSet[v] = struct{}{}
	}

	hit := map[string]struct{}{}
	result := geojson.NewFeatureCollection()
	for _, f := range features {
		v1, ok := f.Properties[key1].(string)
		if !ok {
			continue
		}

		v2, ok := f.Properties[key2].(string)
		if !ok {
			continue
		}

		value := v1 + v2

		if len(valueSet) > 0 {
			_, ok = valueSet[value]
		} else {
			ok = true
		}

		if ok {
			properties := map[string]any{
				"pref": v1,
				"city": v2,
				"code": citycodem[value],
			}
			if citycodem != nil {
				if code := citycodem[value]; code != "" {
					properties["code"] = code
					f.ID = code
				}
			}
			f.Properties = properties
			result.AddFeature(f)
			hit[value] = struct{}{}
		}
	}

	var notfound []string
	for _, v := range values {
		if _, ok := hit[v]; !ok {
			notfound = append(notfound, v)
		}
	}

	return result, notfound
}

func loadFeatures(ctx context.Context, dirpath string, simplifyTolerance float64) ([]*geojson.Feature, error) {
	files, err := os.ReadDir(dirpath)
	if err != nil {
		return nil, err
	}

	var features []*geojson.Feature
	for _, f := range files {
		name := f.Name()
		if f.IsDir() || filepath.Ext(name) != ".topojson" {
			continue
		}

		p := filepath.Join(dirpath, name)
		file, err := os.ReadFile(p)
		if err != nil {
			log.Debugfc(ctx, "govpolygon: error reading file (%s): %s", name, err)
			continue
		}

		topology, err := topojson.UnmarshalTopology(file)
		if err != nil {
			log.Debugfc(ctx, "govpolygon: error unmarshaling topojson (%s): %s", name, err)
			continue
		}

		f := topology.ToGeoJSON()
		if f == nil {
			log.Debugfc(ctx, "govpolygon: error converting topojson to geojson (%s)", name)
			continue
		}

		// fix invalid polygons
		for _, f := range f.Features {
			if f.Geometry == nil {
				continue
			}

			if f.Geometry.Polygon != nil {
				p := fixPolygon(f.Geometry.Polygon, simplifyTolerance)
				if p == nil {
					continue
				}
				f.Geometry.Polygon = p
			}

			if f.Geometry.MultiPolygon != nil {
				polygons := make([][][][]float64, 0, len(f.Geometry.MultiPolygon))
				for _, p := range f.Geometry.MultiPolygon {
					if p2 := fixPolygon(p, simplifyTolerance); p2 != nil {
						polygons = append(polygons, p2)
					}
				}

				if len(polygons) == 0 {
					continue
				}

				f.Geometry.MultiPolygon = polygons
			}

			features = append(features, f)
		}
	}

	return features, nil
}

func fixPolygon(polygons [][][]float64, simplifyTolerance float64) [][][]float64 {
	result := make([][][]float64, 0, len(polygons))
	invalid := false
	for _, r := range polygons {
		// if len(r) < 4 {
		// 	// invalid polygon
		// 	invalid = true
		// 	break
		// }

		// simplify
		if simplifyTolerance > 0 {
			r = simplify.Simplify(r, simplifyTolerance, false)
		}

		// TODO: rewind if necessary
		// https://github.com/mapbox/geojson-rewind/blob/main/index.js

		result = append(result, r)
	}

	if invalid {
		return nil
	}

	return result
}

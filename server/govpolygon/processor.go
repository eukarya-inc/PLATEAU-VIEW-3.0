package govpolygon

import (
	"context"
	"fmt"
	"os"
	"sort"

	geojson "github.com/paulmach/go.geojson"
	"github.com/samber/lo"
)

type Processor struct {
	path string
}

func NewProcessor(path string) *Processor {
	return &Processor{
		path: path,
	}
}

func (p *Processor) ComputeGeoJSON(ctx context.Context, codes []string) (*geojson.FeatureCollection, []string, error) {
	// features, err := loadFeaturesFromTopoJSON(context.Background(), p.dirpath, p.simplifyTolerance)
	features, err := loadFeaturesFromGeoJSON(p.path)
	if err != nil {
		return nil, nil, err
	}

	if len(features) == 0 {
		return nil, nil, fmt.Errorf("no features found")
	}

	res, notfound := computeGeojsonFeatures2(features, "code", codes)
	return res, notfound, nil
}

func computeGeojsonFeatures2(features []*geojson.Feature, key string, codes []string) (*geojson.FeatureCollection, []string) {
	valueSet := map[string]struct{}{}
	for _, v := range codes {
		valueSet[v] = struct{}{}
	}

	notfound := map[string]struct{}{}
	result := geojson.NewFeatureCollection()
	for _, f := range features {
		v, ok := f.Properties[key].(string)
		if !ok {
			continue
		}

		if len(valueSet) > 0 {
			_, ok = valueSet[v]
		} else {
			ok = true
		}

		if ok {
			properties := f.Properties
			f.Properties = properties
			result.AddFeature(f)
		} else {
			notfound[v] = struct{}{}
		}
	}

	notfounds := lo.Keys(notfound)
	sort.Strings(notfounds)

	return result, notfounds
}

func loadFeaturesFromGeoJSON(path string) ([]*geojson.Feature, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read geojson: %w", err)
	}

	f, err := geojson.UnmarshalFeatureCollection(b)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal geojson: %w", err)
	}

	return f.Features, nil
}

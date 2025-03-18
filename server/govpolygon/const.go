package govpolygon

import (
	_ "embed"
	"fmt"

	geojson "github.com/paulmach/go.geojson"
)

//go:embed govpolygondata/japan_city.geojson
var japanCityGeoJson []byte

var JapanCityFeatures []*geojson.Feature

func init() {
	features, err := loadFeaturesFromGeoJSON()
	if err != nil {
		panic(fmt.Sprintf("govpolygon: failed to load features from geojson: %v", err))
	}

	JapanCityFeatures = features
}

func loadFeaturesFromGeoJSON() ([]*geojson.Feature, error) {
	f, err := geojson.UnmarshalFeatureCollection(japanCityGeoJson)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal geojson: %w", err)
	}

	return f.Features, nil
}

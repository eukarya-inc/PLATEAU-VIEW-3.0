package govpolygon

import (
	"github.com/paulmach/orb/encoding/mvt"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/maptile"
)

func geoJSONToMVT(x, y, z uint32, fc *geojson.FeatureCollection) ([]byte, error) {
	layers := map[string]*geojson.FeatureCollection{
		"govpolygon": fc,
	}

	l := mvt.NewLayers(layers)
	l.ProjectToTile(maptile.New(x, y, maptile.Zoom(z)))
	// l.Simplify(simplify.DouglasPeucker(1.0))
	// l.RemoveEmpty(1.0, 1.0)

	data, err := mvt.Marshal(l)
	if err != nil {
		return nil, err
	}

	return data, nil
}

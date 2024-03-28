package govpolygon

import (
	"github.com/JamesLMilner/quadtree-go"
	geojson "github.com/paulmach/go.geojson"
)

type Quadtree struct {
	qt *quadtree.Quadtree
	ft map[quadtree.Bounds]string
}

func NewQuadtree(f []*geojson.Feature) *Quadtree {
	ft := map[quadtree.Bounds]string{}
	qt := &quadtree.Quadtree{
		MaxObjects: 10,
		MaxLevels:  100,
		Objects:    make([]quadtree.Bounds, 0),
		Nodes:      make([]quadtree.Quadtree, 0),
	}

	for _, f := range f {
		b, ok := bounds(f.Geometry)
		if !ok {
			continue
		}

		qt.Insert(b)
		ft[b] = f.Properties["code"].(string)
	}

	return &Quadtree{
		qt: qt,
		ft: ft,
	}
}

func (q *Quadtree) Find(lng, lat float64) (string, bool) {
	res := q.qt.RetrieveIntersections(quadtree.Bounds{
		X: lng,
		Y: lat,
	})
	if len(res) == 0 {
		return "", false
	}

	r, ok := q.ft[res[0]]
	return r, ok
}

func bounds(g *geojson.Geometry) (b quadtree.Bounds, _ bool) {
	if !g.IsMultiPolygon() && !g.IsPolygon() {
		return
	}

	if g.IsPolygon() {
		g = &geojson.Geometry{
			Type:         "MultiPolygon",
			MultiPolygon: [][][][]float64{g.Polygon},
		}
	}

	minlat := -1.0
	minlng := -1.0
	maxlat := -1.0
	maxlng := -1.0

	for _, polygon := range g.MultiPolygon {
		for _, ring := range polygon {
			for _, p := range ring {
				lng := p[0]
				lat := p[1]

				if minlat == -1 || lat < minlat {
					minlat = lat
				}
				if minlng == -1 || lng < minlng {
					minlng = lng
				}

				if maxlat == -1 || lat > maxlat {
					maxlat = lat
				}
				if maxlng == -1 || lng > maxlng {
					maxlng = lng
				}
			}
		}
	}

	return quadtree.Bounds{
		X:      minlng,
		Y:      minlat,
		Width:  maxlng - minlng,
		Height: maxlat - minlat,
	}, true
}

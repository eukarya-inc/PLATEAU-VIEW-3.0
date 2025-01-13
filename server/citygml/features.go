package citygml

import (
	"encoding/xml"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/geo"
	"github.com/eukarya-inc/reearth-plateauview/server/geo/spatialid"

	"github.com/orisano/gosax/xmlb"
)

func Features(r io.Reader, spatialIDs []string) ([]string, error) {
	var filter lod1SolidFilter
	for _, sid := range spatialIDs {
		b, err := spatialid.Bounds(sid)
		if err != nil {
			return nil, fmt.Errorf("invalid spatialID: %w", err)
		}
		filter.Bounds = append(filter.Bounds, b)
	}
	dec := xmlb.NewDecoder(r, make([]byte, 32*1024))
	fs := &featureScanner{
		Dec: dec,
	}
	var features []string
	for fs.Scan() {
		feature, _ := fs.Feature()
		h := lod1SolidHandler{
			Next: skipAttrHandler{},
		}
		if err := processFeature(dec, &h); err != nil {
			return nil, err
		}
		if filter.IsIntersect(h.Faces) {
			features = append(features, feature)
		}
	}
	if err := fs.Err(); err != nil {
		return nil, err
	}
	return features, nil
}

type lod1SolidFilter struct {
	Bounds []geo.Bounds3
}

func (f *lod1SolidFilter) IsIntersect(faces []geo.Polygon3) bool {
	if len(faces) == 0 {
		return false
	}
	po := geo.Polyhedron(faces)
	poB := po.Bounds()
	var lod1Solid *geo.LOD1Solid
	for _, b := range f.Bounds {
		if !b.IsIntersect(poB) {
			continue
		}
		if lod1Solid == nil {
			so := geo.ReconstructLOD1Solid(po)
			lod1Solid = &so
		}
		if lod1Solid.IsIntersect(b) {
			return true
		}
	}
	return false
}

type lod1SolidHandler struct {
	Next  attrHandler
	Faces []geo.Polygon3
}

func (h *lod1SolidHandler) HandleAttr(dec *xmlb.Decoder, el xml.StartElement) error {
	if el.Name.Local == "lod1Solid" {
		s := &tagScanner{
			dec: dec,
			tag: "gml:posList",
		}
		for s.Scan() {
			text, err := s.Text()
			if err != nil {
				return err
			}
			posList, err := parsePosList(text)
			if err != nil {
				return fmt.Errorf("parse posList: %w", err)
			}
			h.Faces = append(h.Faces, posList)
		}
		return s.Err()
	} else {
		return h.Next.HandleAttr(dec, el)
	}
}

func parsePosList(t string) ([]geo.Point3, error) {
	tokens := strings.Split(t, " ")
	if len(tokens)%3 != 0 {
		return nil, fmt.Errorf("invalid length")
	}
	// gml:LinearRing の gml:posList なので末尾に先頭と同じ座標が入っているため取り除く
	n := len(tokens)/3 - 1
	if n < 3 {
		return nil, fmt.Errorf("too few points")
	}
	points := make([]geo.Point3, 0, n)
	for i := 0; i < n; i++ {
		p := tokens[i*3:][:3]
		y, err := strconv.ParseFloat(p[0], 64)
		if err != nil {
			return nil, err
		}
		x, err := strconv.ParseFloat(p[1], 64)
		if err != nil {
			return nil, err
		}
		z, err := strconv.ParseFloat(p[2], 64)
		if err != nil {
			return nil, err
		}
		points = append(points, geo.Point3{
			X: x,
			Y: y,
			Z: z,
		})
	}
	return points, nil
}

package citygml

import (
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/geo"
	"github.com/eukarya-inc/reearth-plateauview/server/spatialid"
	"github.com/orisano/gosax/xmlb"
)

func Features(r io.Reader, spatialIDs []string) ([]string, error) {
	var spatialIDBounds []geo.Bounds3
	for _, sid := range spatialIDs {
		b, err := spatialid.Bounds3(sid)
		if err != nil {
			return nil, fmt.Errorf("invalid spatialID: %w", err)
		}
		spatialIDBounds = append(spatialIDBounds, b)
	}

	dec := xmlb.NewDecoder(r, make([]byte, 32*1024))
	var features []string
	for {
		tok, err := dec.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("token: %w", err)
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := tok.StartElement()
			if err != nil {
				return nil, fmt.Errorf("start element: %w", err)
			}
			feature, ok := findAttrNS(el.Attr, "gml", "id")
			if !ok {
				continue
			}
			if found, err := skipUntil(dec, "lod1Solid"); err != nil {
				return nil, err
			} else if !found {
				continue
			}
			s := &tagScanner{
				dec: dec,
				tag: "gml:posList",
			}
			var faces []geo.Polygon3
			for s.Scan() {
				text, err := s.Text()
				if err != nil {
					return nil, err
				}
				posList, err := parsePosList(text)
				if err != nil {
					return nil, fmt.Errorf("parse posList(%s): %w", feature, err)
				}
				faces = append(faces, posList)
			}
			if err := s.Err(); err != nil {
				return nil, err
			}
			if err := dec.Skip(); err != nil {
				return nil, err
			}
			if len(faces) == 0 {
				continue
			}
			fb := geo.Polyhedron(faces).Bounds()
			for _, b := range spatialIDBounds {
				if b.IsIntersect(fb) {
					features = append(features, feature)
					break
				}
			}
		}
	}
	return features, nil
}

func skipUntil(dec *xmlb.Decoder, tag string) (bool, error) {
	for {
		tok, err := dec.Token()
		if err != nil {
			return false, err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := tok.StartElement()
			if err != nil {
				return false, err
			}
			if el.Name.Local == tag {
				return true, nil
			}
			if err := dec.Skip(); err != nil {
				return false, err
			}
		case xmlb.EndElement:
			return false, nil
		}
	}
}

func parsePosList(t string) ([]geo.Point3, error) {
	tokens := strings.Split(t, " ")
	if len(tokens)%3 != 0 {
		return nil, fmt.Errorf("invalid length")
	}
	n := len(tokens) / 3
	if n < 3 {
		return nil, fmt.Errorf("too few points")
	}
	points := make([]geo.Point3, 0, n)
	for i := 0; i+3 < len(tokens); i += 3 {
		y, err := strconv.ParseFloat(tokens[i+0], 64)
		if err != nil {
			return nil, err
		}
		x, err := strconv.ParseFloat(tokens[i+1], 64)
		if err != nil {
			return nil, err
		}
		z, err := strconv.ParseFloat(tokens[i+2], 64)
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

type tagScanner struct {
	dec *xmlb.Decoder
	tag string

	err   error
	depth int
}

func (s *tagScanner) Scan() bool {
	for {
		tok, err := s.dec.Token()
		if err != nil {
			s.err = err
			return false
		}
		switch tok.Type() {
		case xmlb.StartElement:
			s.depth++
			el, err := tok.StartElement()
			if err != nil {
				s.err = err
				return false
			}
			if tagName(el.Name) == s.tag {
				return true
			}
		case xmlb.EndElement:
			if s.depth == 0 {
				return false
			}
			s.depth--
		}
	}
}

func (s *tagScanner) Text() (string, error) {
	return s.dec.Text()
}

func (s *tagScanner) Err() error {
	return s.err
}

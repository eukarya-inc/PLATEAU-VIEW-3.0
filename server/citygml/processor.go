package citygml

import (
	"bytes"
	"encoding/xml"
	"errors"
	"fmt"
	"io"

	"github.com/orisano/gosax"
	"github.com/orisano/gosax/xmlb"
)

type featureScanner struct {
	Dec *xmlb.Decoder

	ns map[string]string

	id  string
	el  xml.StartElement
	err error
}

func (s *featureScanner) Scan() bool {
	for {
		tok, err := s.Dec.Token()
		if err == io.EOF {
			return false
		}
		if err != nil {
			s.err = err
			return false
		}
		switch tok.Type() {
		case xmlb.StartElement:
			bel := tok.StartElementBytes()
			if err := s.registerNamespace(bel.Attrs); err != nil {
				s.err = err
				return false
			}
			id := s.findFeatureID(bel.Attrs)
			if id != "" {
				el, err := tok.StartElement()
				if err != nil {
					s.err = err
					return false
				}
				s.id = id
				s.el = el
				return true
			}
		}
	}
}

func (s *featureScanner) Feature() (string, xml.StartElement) {
	return s.id, s.el
}

func (s *featureScanner) Err() error {
	return s.err
}

func (s *featureScanner) findFeatureID(attr xmlb.AttributesBytes) string {
	b := []byte(attr)
	for len(b) > 0 {
		a, rest, err := gosax.NextAttribute(b)
		if err != nil {
			return ""
		}
		b = rest
		space, local := attrName(a.Key)
		if s.ns[string(space)] == "http://www.opengis.net/gml" && string(local) == "id" {
			v, err := gosax.Unescape(a.Value[1 : len(a.Value)-1])
			if err == nil {
				return string(v)
			}
		}
	}
	return ""
}

func (s *featureScanner) registerNamespace(attr xmlb.AttributesBytes) error {
	if s.ns == nil {
		s.ns = map[string]string{}
	}
	b := []byte(attr)
	for len(b) > 0 {
		a, rest, err := gosax.NextAttribute(b)
		if err != nil {
			return err
		}
		b = rest
		space, local := attrName(a.Key)
		if string(space) == "xmlns" {
			v, err := gosax.Unescape(a.Value[1 : len(a.Value)-1])
			if err != nil {
				return err
			}
			s.ns[string(local)] = string(v)
		} else if len(space) == 0 && string(local) == "xmlns" {
			v, err := gosax.Unescape(a.Value[1 : len(a.Value)-1])
			if err != nil {
				return err
			}
			s.ns[""] = string(v)
		}
	}
	return nil
}

type attrHandler interface {
	HandleAttr(dec *xmlb.Decoder, el xml.StartElement) error
}

type skipAttrHandler struct{}

func (h skipAttrHandler) HandleAttr(dec *xmlb.Decoder, el xml.StartElement) error {
	return dec.Skip()
}

var errSkipFeature = fmt.Errorf("skip feature")

func processFeature(dec *xmlb.Decoder, h attrHandler) (bool, error) {
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
			if err := h.HandleAttr(dec, el); err != nil {
				if errors.Is(err, errSkipFeature) {
					return false, dec.Skip()
				} else {
					return false, err
				}
			}
		case xmlb.EndElement:
			return true, nil
		}
	}
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
			name, _ := gosax.Name(tok.Bytes)
			if string(name) == s.tag {
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

func tagName(name xml.Name) string {
	if name.Space != "" {
		return name.Space + ":" + name.Local
	}
	return name.Local
}

func findAttr(attr []xml.Attr, name string) (string, bool) {
	for _, a := range attr {
		if a.Name.Local == name {
			return a.Value, true
		}
	}
	return "", false
}

func attrName(key []byte) ([]byte, []byte) {
	p := bytes.IndexByte(key, ':')
	if p >= 0 {
		return key[:p], key[p+1:]
	} else {
		return nil, key
	}
}

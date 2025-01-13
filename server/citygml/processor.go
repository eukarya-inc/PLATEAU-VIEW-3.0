package citygml

import (
	"encoding/xml"
	"io"

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
			el, err := tok.StartElement()
			if err != nil {
				s.err = err
				return false
			}
			s.registerNamespace(el)
			id := s.findFeatureID(el.Attr)
			if id != "" {
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

func (s *featureScanner) findFeatureID(attr []xml.Attr) string {
	for _, a := range attr {
		if s.ns[a.Name.Space] == "http://www.opengis.net/gml" && a.Name.Local == "id" {
			return a.Value
		}
	}
	return ""
}

func (s *featureScanner) registerNamespace(e xml.StartElement) {
	if s.ns == nil {
		s.ns = map[string]string{}
	}
	for _, a := range e.Attr {
		if a.Name.Space == "xmlns" {
			s.ns[a.Name.Local] = a.Value
		} else if a.Name.Space == "" && a.Name.Local == "xmlns" {
			s.ns[""] = a.Value
		}
	}
}

type attrHandler interface {
	HandleAttr(dec *xmlb.Decoder, el xml.StartElement) error
}

type skipAttrHandler struct{}

func (h skipAttrHandler) HandleAttr(dec *xmlb.Decoder, el xml.StartElement) error {
	return dec.Skip()
}

func processFeature(dec *xmlb.Decoder, h attrHandler) error {
	for {
		tok, err := dec.Token()
		if err != nil {
			return err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := tok.StartElement()
			if err != nil {
				return err
			}
			if err := h.HandleAttr(dec, el); err != nil {
				return err
			}
		case xmlb.EndElement:
			return nil
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

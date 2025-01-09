package citygml

import (
	_ "embed"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"

	"github.com/orisano/gosax/xmlb"
)

type schemaDefinition struct {
	Features     map[string]schema `json:"features"`
	ComplexTypes map[string]schema `json:"complexTypes"`
}

type schema []schemaProperty

type schemaProperty struct {
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	MinOccurs string   `json:"minOccurs"`
	MaxOccurs string   `json:"maxOccurs"`
	Flag      string   `json:"flag"`
	Children  []string `json:"children"`
}

func (p *schemaProperty) Many() bool {
	return p.MaxOccurs == "unbounded" || p.maxOccurs() > 1
}

func (p *schemaProperty) maxOccurs() int {
	if v, err := strconv.Atoi(p.MaxOccurs); err == nil {
		return v
	} else {
		return 0
	}
}

//go:embed schema_defs.json
var schemaDefsJSON []byte

//go:embed common_defs.json
var commonDefsJSON []byte

func initCommonProperties() []schemaProperty {
	var cp []schemaProperty
	if err := json.Unmarshal(commonDefsJSON, &cp); err != nil {
		panic(err)
	}
	return cp
}

type tagHandler interface {
	// Handle は StartElement の状態で実行される。終了時には EndElement まで消費している必要がある
	Handle(obj map[string]any, ae *attributeExtractor, e xml.StartElement) error
}

type attributeUnmarshaler interface {
	UnmarshalAttr(ae *attributeExtractor, e xml.StartElement) (any, error)
}

type genHandler struct {
}

func (h genHandler) Handle(obj map[string]any, ae *attributeExtractor, e xml.StartElement) error {
	key := "gen:genericAttribute"
	t := "unknown"
	if ae.isGen(e.Name) {
		if v, ok := genAttrTypes[e.Name.Local]; ok {
			t = v
		}
	}
	for {
		tok, err := ae.Token()
		if err != nil {
			return err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			e2, err := ae.StartElement(tok)
			if err != nil {
				return err
			}
			if ae.isGen(e2.Name) && e2.Name.Local == "value" {
				b, err := ae.Text()
				if err != nil {
					return err
				}
				text := string(b)
				if err := ae.Skip(); err != nil {
					return err
				}
				if err := ae.Skip(); err != nil {
					return err
				}
				name, _ := findAttr(e.Attr, "name")
				attr := map[string]any{
					"type": t,
					"name": name,
				}
				switch t {
				case "int":
					if v, err := strconv.Atoi(text); err == nil {
						attr["value"] = v
					} else {
						return fmt.Errorf("value not int: %w", err)
					}
				case "double":
					if v, err := strconv.ParseFloat(text, 64); err == nil {
						attr["value"] = v
					} else {
						return fmt.Errorf("value not float: %w", err)
					}
				case "measure":
					if v, err := strconv.ParseFloat(text, 64); err == nil {
						attr["value"] = v
					} else {
						return fmt.Errorf("value not float: %w", err)
					}
					attr["uom"], _ = findAttr(e2.Attr, "uom")
				default:
					attr["value"] = text
				}
				if a, ok := obj[key]; ok {
					obj[key] = append(a.([]any), attr)
				} else {
					obj[key] = []any{attr}
				}
				return nil
			}
		case xmlb.EndElement:
			return nil
		}
	}
}

type addressUnmarshaler struct{}

func (h addressUnmarshaler) UnmarshalAttr(ae *attributeExtractor, e xml.StartElement) (any, error) {
	var localityNames []string
	var dependentLocalities []string
	depth := 0
	for {
		tok, err := ae.Token()
		if err != nil {
			return nil, err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			e2, err := ae.StartElement(tok)
			if err != nil {
				return nil, err
			}
			switch tagName(e2.Name) {
			case "xAL:LocalityName":
				t, err := ae.Text()
				if err != nil {
					return nil, err
				}
				if len(t) > 0 {
					localityNames = append(localityNames, string(t))
				}
				depth++
			case "xAL:DependentLocality":
				if typ, ok := findAttr(e2.Attr, "Type"); ok && typ == "district" {
					dependentLocalities, err = h.appendText(dependentLocalities, ae)
					if err != nil {
						return nil, err
					}
				} else {
					depth++
				}
			default:
				depth++
			}
		case xmlb.EndElement:
			if depth == 0 {
				var s strings.Builder
				for _, x := range localityNames {
					s.WriteString(x)
				}
				for _, x := range dependentLocalities {
					s.WriteString(x)
				}
				return s.String(), nil
			}
			depth--
		}
	}
}

func (h addressUnmarshaler) appendText(dest []string, ae *attributeExtractor) ([]string, error) {
	for {
		tok, err := ae.Token()
		if err != nil {
			return dest, err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			t, err := ae.Text()
			if err != nil {
				return dest, err
			}
			if len(t) > 0 {
				dest = append(dest, string(t))
			}
			if err := ae.Skip(); err != nil {
				return dest, err
			}
		case xmlb.EndElement:
			return dest, nil
		}
	}
}

type objectHandler struct {
	children map[string]tagHandler
}

func (h objectHandler) Handle(obj map[string]any, ae *attributeExtractor, e xml.StartElement) error {
	for {
		tok, err := ae.Token()
		if err != nil {
			return err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			e2, err := ae.StartElement(tok)
			if err != nil {
				return err
			}
			key := tagName(e2.Name)
			if ch, ok := h.children[key]; ok {
				if err := ch.Handle(obj, ae, e2); err != nil {
					return err
				}
			} else if ae.isGen(e2.Name) {
				gh := genHandler{}
				if err := gh.Handle(obj, ae, e2); err != nil {
					return err
				}
			} else if err := ae.Skip(); err != nil {
				return err
			}
		case xmlb.EndElement:
			return nil
		}
	}
}

type sliceHandler struct {
	au attributeUnmarshaler

	codeResolver codeResolver
}

func (h sliceHandler) Handle(obj map[string]any, ae *attributeExtractor, e xml.StartElement) error {
	key := tagName(e.Name)
	v, err := h.au.UnmarshalAttr(ae, e)
	if err != nil {
		return err
	}
	if codeSpace, ok := findAttr(e.Attr, "codeSpace"); ok {
		if text, ok := v.(string); ok {
			if h.codeResolver != nil {
				resolved, err := h.codeResolver.Resolve(codeSpace, text)
				if err != nil {
					return fmt.Errorf("resolve code: %w", err)
				}
				v := resolved
				if a, ok := obj[key]; ok {
					obj[key] = append(a.([]any), v)
				} else {
					obj[key] = []any{v}
				}
			}
			key := key + "_code"
			v := text
			if a, ok := obj[key]; ok {
				obj[key] = append(a.([]any), v)
			} else {
				obj[key] = []any{v}
			}
		}
	} else {
		if a, ok := obj[key]; ok {
			obj[key] = append(a.([]any), v)
		} else {
			obj[key] = []any{v}
		}
		if uom, ok := findAttr(e.Attr, "uom"); ok {
			k := key + "_uom"
			if a, ok := obj[k]; ok {
				obj[k] = append(a.([]any), uom)
			} else {
				obj[k] = []any{uom}
			}
		}
	}
	return nil
}

type valueHandler struct {
	au attributeUnmarshaler

	codeResolver codeResolver
}

func (h valueHandler) Handle(obj map[string]any, ae *attributeExtractor, e xml.StartElement) error {
	key := tagName(e.Name)
	v, err := h.au.UnmarshalAttr(ae, e)
	if err != nil {
		return err
	}
	if codeSpace, ok := findAttr(e.Attr, "codeSpace"); ok {
		if text, ok := v.(string); ok {
			if h.codeResolver != nil {
				resolved, err := h.codeResolver.Resolve(codeSpace, text)
				if err != nil {
					return fmt.Errorf("resolve code: %w", err)
				}
				obj[key] = resolved
			}
			obj[key+"_code"] = text
		}
	} else {
		obj[key] = v
		if uom, ok := findAttr(e.Attr, "uom"); ok {
			obj[key+"_uom"] = uom
		}
	}
	return nil
}

type objectUnmarshaler struct {
	h objectHandler
}

func (u objectUnmarshaler) UnmarshalAttr(ae *attributeExtractor, e xml.StartElement) (any, error) {
	obj := map[string]any{}
	if err := u.h.Handle(obj, ae, e); err != nil {
		return nil, err
	}
	return obj, nil
}

type textAttrUnmarshaler struct{}

func (u textAttrUnmarshaler) UnmarshalAttr(ae *attributeExtractor, e xml.StartElement) (any, error) {
	c, err := ae.Text()
	if err != nil {
		return nil, err
	}
	t := string(c)
	if err := ae.Skip(); err != nil {
		return nil, err
	}
	return t, nil
}

type anyAttrUnmarshaler struct{}

func (u anyAttrUnmarshaler) UnmarshalAttr(ae *attributeExtractor, e xml.StartElement) (any, error) {
	c, err := ae.Text()
	if err != nil {
		return nil, err
	}
	t := string(c)
	if err := ae.Skip(); err != nil {
		return nil, err
	}
	if strings.ContainsAny(t, "eE") {
		if _, err := strconv.ParseFloat(t, 64); err == nil {
			return t, nil
		}
	}
	switch strings.ToLower(t) {
	case "inf", "-inf", "nan":
		return t, nil
	}
	return parseText(t), nil
}

func toTagHandler(t string, types map[string][]schemaProperty, resolver codeResolver) tagHandler {
	m := map[string]tagHandler{}
	nonNumericTypes := map[string]bool{
		"xs:string":    true,
		"gml:CodeType": true,
		"xs:date":      true,
		"xs:gYear":     true,
		"xs:anyURI":    true,
	}
	nonNumericTags := map[string]bool{
		"uro:lodType": true,
	}

	for _, p := range types[t] {
		if p.Flag == "feature" || p.Flag == "geometry" {
			continue
		}
		var au attributeUnmarshaler
		if p.Type == "core:AddressPropertyType" {
			au = addressUnmarshaler{}
		} else if len(p.Children) > 0 {
			m2 := map[string]tagHandler{}
			for _, c := range p.Children {
				m2[c] = toTagHandler(c, types, resolver)
			}
			au = objectUnmarshaler{
				h: objectHandler{children: m2},
			}
		} else if nonNumericTypes[p.Type] || nonNumericTags[p.Name] {
			au = textAttrUnmarshaler{}
		} else {
			au = anyAttrUnmarshaler{}
		}
		if p.Many() {
			m[p.Name] = sliceHandler{
				au:           au,
				codeResolver: resolver,
			}
		} else {
			m[p.Name] = valueHandler{
				au:           au,
				codeResolver: resolver,
			}
		}
	}
	return objectHandler{
		children: m,
	}
}

var schemaDefs map[string][]schemaProperty

func initSchema() {
	var def schemaDefinition
	if err := json.Unmarshal(schemaDefsJSON, &def); err != nil {
		panic(err)
	}

	for _, dm := range []string{"uro:DmGeometricAttribute", "uro:DmAnnotation"} {
		ps, ok := def.ComplexTypes[dm]
		if !ok {
			continue
		}
		for i, p := range ps {
			if strings.HasPrefix(p.Name, "uro:lod0") {
				ps[i].Flag = "geometry"
			}
		}
	}

	commonProps := initCommonProperties()

	schemaDefs = map[string][]schemaProperty{}
	for t, ps := range def.ComplexTypes {
		schemaDefs[t] = ps
	}
	for t, ps := range def.Features {
		var props []schemaProperty
		props = append(props, commonProps...)
		props = append(props, ps...)
		schemaDefs[t] = props
	}
}

func init() {
	initSchema()
}

type codeResolver interface {
	Resolve(codeSpace, code string) (string, error)
}

type fetchCodeResolver struct {
	client *http.Client
	url    string
	// リクエストをまたぐ場合は LRU を検討する
	// キャッシュヒット率, キャッシュヒット数とかログに出力しておく
	cache map[string]map[string]string
}

func (r *fetchCodeResolver) Resolve(codeSpace, code string) (string, error) {
	if r.cache == nil {
		r.cache = map[string]map[string]string{}
	}
	u, err := url.JoinPath(r.url, "..", codeSpace)
	if err != nil {
		return "", err
	}
	if m, ok := r.cache[codeSpace]; ok {
		return m[code], nil
	}
	resp, err := r.client.Get(u)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("status code: %d", resp.StatusCode)
	}
	codeMap := map[string]string{}
	var name, description string
	ae := &attributeExtractor{
		dec: xmlb.NewDecoder(resp.Body, make([]byte, 32*1024)),
	}
	for {
		tok, err := ae.Token()
		if err == io.EOF {
			break
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := ae.StartElement(tok)
			if err != nil {
				return "", err
			}
			switch tagName(el.Name) {
			case "gml:Definition":
				name = ""
				description = ""
			case "gml:description":
				if t, err := ae.Text(); err == nil {
					description = string(t)
				}
			case "gml:name":
				if t, err := ae.Text(); err == nil {
					name = string(t)
				}
			}
		case xmlb.EndElement:
			el := tok.EndElement()
			if tagName(el.Name) == "gml:Definition" {
				codeMap[name] = description
			}
		}
	}
	r.cache[codeSpace] = codeMap
	resolved, ok := codeMap[code]
	if !ok {
		return "", fmt.Errorf("code %q not found in codeSpace %q", code, codeSpace)
	}
	return resolved, nil
}

func Attributes(r io.Reader, gmlID []string, resolver codeResolver) ([]map[string]any, error) {
	ae := attributeExtractor{
		dec: xmlb.NewDecoder(r, make([]byte, 32*1024)),
	}
	var attributes []map[string]any
	for {
		tok, err := ae.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("token: %w", err)
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := ae.StartElement(tok)
			if err != nil {
				return nil, fmt.Errorf("start element: %w", err)
			}
			if _, ok := xmlns[ae.Namespace(el.Name)]; !ok {
				continue
			}
			id := ae.gmlID(el.Attr)
			if slices.Contains(gmlID, id) {
				val := map[string]any{
					"gml:id":       id,
					"feature_type": tagName(el.Name),
				}
				h := toTagHandler(tagName(el.Name), schemaDefs, resolver)
				if err := h.Handle(val, &ae, el); err != nil {
					return nil, err
				}
				attributes = append(attributes, val)
				if len(attributes) == len(gmlID) {
					return attributes, nil
				}
			}
		}
	}
	return nil, nil
}

func (ae *attributeExtractor) Skip() error {
	var depth int64
	for {
		tok, err := ae.Token()
		if err != nil {
			return err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			depth++
		case xmlb.EndElement:
			if depth == 0 {
				return nil
			}
			depth--
		default:
		}
	}
}

type attributeExtractor struct {
	dec  *xmlb.Decoder
	ns   map[string]string
	next *xmlb.Token
}

func (ae *attributeExtractor) StartElement(tok xmlb.Token) (xml.StartElement, error) {
	el, err := tok.StartElement()
	if err != nil {
		return xml.StartElement{}, err
	}
	ae.registerNamespace(el)
	return el, nil
}

func (ae *attributeExtractor) Namespace(tok xml.Name) string {
	return ae.ns[tok.Space]
}

func (ae *attributeExtractor) Token() (xmlb.Token, error) {
	if t := ae.next; t != nil {
		ae.next = nil
		return *t, nil
	}
	return ae.dec.Token()
}

func (ae *attributeExtractor) Text() (xml.CharData, error) {
	tok, err := ae.dec.Token()
	if err != nil {
		return nil, err
	}
	if tok.Type() != xmlb.CharData {
		ae.next = &tok
		return nil, nil
	}
	return tok.CharData()
}

func (ae *attributeExtractor) isGen(n xml.Name) bool {
	return ae.ns[n.Space] == "http://www.opengis.net/citygml/generics/2.0"
}

func (ae *attributeExtractor) registerNamespace(e xml.StartElement) {
	if ae.ns == nil {
		ae.ns = map[string]string{}
	}
	for _, a := range e.Attr {
		if a.Name.Space == "xmlns" {
			ae.ns[a.Name.Local] = a.Value
		} else if a.Name.Space == "" && a.Name.Local == "xmlns" {
			ae.ns[""] = a.Value
		}
	}
}

func (ae *attributeExtractor) gmlID(attr []xml.Attr) string {
	for _, a := range attr {
		if ae.ns[a.Name.Space] == "http://www.opengis.net/gml" && a.Name.Local == "id" {
			return a.Value
		}
	}
	return ""
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

func parseText(s string) any {
	if x, err := strconv.ParseInt(s, 10, 64); err == nil {
		return x
	}
	if x, err := strconv.ParseFloat(s, 64); err == nil {
		return x
	}
	return s
}

var xmlns = map[string]bool{
	"http://www.opengis.net/citygml/appearance/2.0":      true,
	"http://www.opengis.net/citygml/building/2.0":        true,
	"http://www.opengis.net/citygml/bridge/2.0":          true,
	"http://www.opengis.net/citygml/2.0":                 true,
	"http://www.opengis.net/citygml/relief/2.0":          true,
	"http://www.opengis.net/citygml/cityfurniture/2.0":   true,
	"http://www.opengis.net/citygml/generics/2.0":        true,
	"http://www.opengis.net/gml":                         true,
	"http://www.opengis.net/citygml/cityobjectgroup/2.0": true,
	"http://www.opengis.net/citygml/landuse/2.0":         true,
	"http://www.opengis.net/citygml/profiles/base/2.0":   true,
	"http://www.ascc.net/xml/schematron":                 true,
	"http://www.w3.org/2001/SMIL20/":                     true,
	"http://www.w3.org/2001/SMIL20/Language":             true,
	"http://www.opengis.net/citygml/texturedsurface/2.0": true,
	"http://www.opengis.net/citygml/transportation/2.0":  true,
	"http://www.opengis.net/citygml/tunnel/2.0":          true,
	"http://www.opengis.net/citygml/vegetation/2.0":      true,
	"http://www.opengis.net/citygml/waterbody/2.0":       true,
	"urn:oasis:names:tc:ciq:xsdschema:xAL:2.0":           true,
	"http://www.w3.org/1999/xlink":                       true,
	"http://www.w3.org/2001/XMLSchema-instance":          true,
}

var genAttrTypes = map[string]string{
	"stringAttribute":     "string",
	"intAttribute":        "int",
	"doubleAttribute":     "double",
	"dateAttribute":       "date",
	"uriAttribute":        "uri",
	"measureAttribute":    "measure",
	"genericAttributeSet": "attributeSet",
}

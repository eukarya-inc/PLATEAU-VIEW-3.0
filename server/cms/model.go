package cms

import (
	"encoding/json"
	"reflect"
	"strings"

	"github.com/samber/lo"
)

const (
	AssetArchiveExtractionStatusDone = "done"
	tag                              = "cms"
)

type Asset struct {
	ID                      string `json:"id"`
	ProjectID               string `json:"projectId"`
	URL                     string `json:"url"`
	ArchiveExtractionStatus string `json:"archiveExtractionStatus"`
}

type Model struct {
	ID  string `json:"id"`
	Key string `json:"key,omitempty"`
}

type Items struct {
	Items      []Item `json:"items"`
	Page       int    `json:"page"`
	PerPage    int    `json:"perPage"`
	TotalCount int    `json:"totalCount"`
}

type Item struct {
	ID      string  `json:"id"`
	ModelID string  `json:"modelId"`
	Fields  []Field `json:"fields"`
}

func (i Item) Field(id string) *Field {
	f, ok := lo.Find(i.Fields, func(f Field) bool { return f.ID == id })
	if ok {
		return &f
	}
	return nil
}

func (i Item) FieldByKey(key string) *Field {
	f, ok := lo.Find(i.Fields, func(f Field) bool { return f.Key == key })
	if ok {
		return &f
	}
	return nil
}

func (d Item) Unmarshal(i any) {
	if i == nil {
		return
	}

	v := reflect.ValueOf(i)
	if v.IsNil() {
		return
	}

	v = v.Elem()
	t := v.Type()

	if t.Kind() != reflect.Struct {
		return
	}

	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		tag := f.Tag.Get(tag)
		key, _, _ := strings.Cut(tag, ",")
		if key == "" || key == "-" {
			continue
		}

		vf := v.FieldByName(f.Name)
		if !vf.CanSet() {
			continue
		}

		if key == "id" {
			if f.Type.Kind() == reflect.String {
				vf.SetString(d.ID)
			}
			continue
		}

		if itf := d.FieldByKey(key); itf != nil {
			if f.Type.Kind() == reflect.String {
				if itfv := itf.ValueString(); itfv != nil {
					vf.SetString(*itfv)
				}
			} else if f.Type.Kind() == reflect.Slice && f.Type.Elem().Kind() == reflect.String {
				if te := f.Type.Elem(); te.Name() == "string" {
					if itfv := itf.ValueStrings(); itfv != nil {
						vf.Set(reflect.ValueOf(itfv))
					}
				} else if itfv := itf.ValueStrings(); itfv != nil {
					s := reflect.MakeSlice(f.Type, 0, len(itfv))
					for _, v := range itfv {
						rv := reflect.ValueOf(v).Convert(te)
						s = reflect.Append(s, rv)
					}
					vf.Set(s)
				}
			}
		}
	}
}

func Marshal(i any, item *Item) {
	if item == nil || i == nil {
		return
	}

	t := reflect.TypeOf(i)
	v := reflect.ValueOf(i)
	if t.Kind() == reflect.Pointer {
		if v.IsNil() {
			return
		}
		t = t.Elem()
		v = v.Elem()
	}
	if t.Kind() != reflect.Struct {
		return
	}

	ni := Item{}
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		tag := f.Tag.Get(tag)
		key, ty, _ := strings.Cut(tag, ",")
		if key == "" || key == "-" {
			continue
		}

		vf := v.FieldByName(f.Name)
		if key == "id" {
			ni.ID, _ = vf.Interface().(string)
			continue
		}

		vft := vf.Type()
		var i any
		if vft.Kind() == reflect.String {
			v := vf.Convert(reflect.TypeOf("")).Interface()
			if v != "" {
				i = v
			}
		} else if vft.Kind() == reflect.Slice && vft.Elem().Kind() == reflect.String && vf.Len() > 0 {
			st := reflect.TypeOf("")
			v := make([]string, 0, vf.Len())
			for i := 0; i < cap(v); i++ {
				vfs := vf.Index(i).Convert(st)
				v = append(v, vfs.String())
			}
			i = v
		}

		if i != nil {
			ni.Fields = append(ni.Fields, Field{
				Key:   key,
				Type:  ty,
				Value: i,
			})
		}
	}

	*item = ni
}

type Field struct {
	ID    string `json:"id,omitempty"`
	Type  string `json:"type"`
	Value any    `json:"value"`
	Key   string `json:"key,omitempty"`
}

func (f *Field) ValueString() *string {
	if f == nil {
		return nil
	}

	if v, ok := f.Value.(string); ok {
		return &v
	}

	return nil
}

func (f *Field) ValueStrings() []string {
	if f == nil {
		return nil
	}

	if v, ok := f.Value.([]string); ok {
		return v
	}

	if v, ok := f.Value.([]any); ok {
		return lo.FilterMap(v, func(e any, _ int) (string, bool) {
			s, ok := e.(string)
			return s, ok
		})
	}

	return nil
}

func (f *Field) ValueInt() *int {
	if f == nil {
		return nil
	}

	if v, ok := f.Value.(int); ok {
		return &v
	}
	return nil
}

func (f *Field) ValueJSON() (any, error) {
	if f == nil {
		return nil, nil
	}
	s := f.ValueString()
	if s == nil {
		return nil, nil
	}

	var j any
	err := json.Unmarshal([]byte(*s), &j)
	return j, err
}

type Schema struct {
	ID        string        `json:"id"`
	Fields    []SchemaField `json:"fields"`
	ProjectID string        `json:"projectId"`
}

func (d Schema) FieldIDByKey(k string) string {
	f, ok := lo.Find(d.Fields, func(f SchemaField) bool {
		return f.Key == k
	})
	if !ok {
		return ""
	}
	return f.ID
}

type SchemaField struct {
	ID   string `json:"id"`
	Type string `json:"type"`
	Key  string `json:"key"`
}

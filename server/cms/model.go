package cms

import "github.com/samber/lo"

type Asset struct {
	ID  string `json:"id"`
	URL string `json:"url"`
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

func (d Item) FieldByKey2(key string, s *Schema) *Field {
	var sfid string
	if s != nil {
		sfid = s.FieldIDByKey(key)
	}
	f, ok := lo.Find(d.Fields, func(f Field) bool {
		return f.Key == key || sfid != "" && f.ID == sfid
	})
	if !ok {
		return nil
	}
	return &f
}

type Field struct {
	ID    string `json:"id"`
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

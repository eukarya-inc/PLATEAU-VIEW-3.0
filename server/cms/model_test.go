package cms

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestItem_Field(t *testing.T) {
	assert.Equal(t, &Field{
		ID: "bbb", Value: "ccc", Type: "string",
	}, Item{
		Fields: []Field{
			{ID: "aaa", Value: "bbb", Type: "string"},
			{ID: "bbb", Value: "ccc", Type: "string"},
		},
	}.Field("bbb"))
	assert.Nil(t, Item{
		Fields: []Field{
			{ID: "aaa", Key: "bbb", Type: "string"},
			{ID: "bbb", Key: "ccc", Type: "string"},
		},
	}.Field("ccc"))
}

func TestItem_FieldByKey(t *testing.T) {
	assert.Equal(t, &Field{
		ID: "bbb", Key: "ccc", Type: "string",
	}, Item{
		Fields: []Field{
			{ID: "aaa", Key: "bbb", Type: "string"},
			{ID: "bbb", Key: "ccc", Type: "string"},
		},
	}.FieldByKey("ccc"))
	assert.Nil(t, Item{
		Fields: []Field{
			{ID: "aaa", Key: "aaa", Type: "string"},
			{ID: "bbb", Key: "ccc", Type: "string"},
		},
	}.FieldByKey("bbb"))
}

func TestField_ValueString(t *testing.T) {
	assert.Equal(t, lo.ToPtr("ccc"), (&Field{
		Value: "ccc",
	}).ValueString())
	assert.Nil(t, (&Field{
		Value: 1,
	}).ValueString())
}

func TestField_ValueStrings(t *testing.T) {
	assert.Equal(t, []string{"ccc", "ddd"}, (&Field{
		Value: []string{"ccc", "ddd"},
	}).ValueStrings())
	assert.Equal(t, []string{"ccc", "ddd"}, (&Field{
		Value: []any{"ccc", "ddd", 1},
	}).ValueStrings())
	assert.Nil(t, (&Field{
		Value: "ccc",
	}).ValueStrings())
}

func TestField_ValueInt(t *testing.T) {
	assert.Equal(t, lo.ToPtr(100), (&Field{
		Value: 100,
	}).ValueInt())
	assert.Nil(t, (&Field{
		Value: "100",
	}).ValueInt())
}

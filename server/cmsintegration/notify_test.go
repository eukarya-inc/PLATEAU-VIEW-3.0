package cmsintegration

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestItemFromUploadResult(t *testing.T) {
	assert.Equal(t, Item{
		All:        "all",
		Dictionary: "dic",
		Bldg:       []string{"bldg"},
		Tran:       []string{"tran"},
		Frn:        []string{"frn"},
		Veg:        []string{"veg"},
		Luse:       []string{"luse"},
		Lsld:       []string{"lsld"},
		Urf:        []string{"urf"},
		Fld:        []string{"fld"},
		Htd:        []string{"htd"},
		Tnm:        []string{"tnm"},
		Ifld:       []string{"ifld"},
	}, itemFromUploadResult(map[string][]string{
		"all":        {"all"},
		"dictionary": {"dic"},
		"bldg":       {"bldg"},
		"tran":       {"tran"},
		"frn":        {"frn"},
		"veg":        {"veg"},
		"luse":       {"luse"},
		"lsld":       {"lsld"},
		"urf":        {"urf"},
		"fld":        {"fld"},
		"htd":        {"htd"},
		"tnm":        {"tnm"},
		"ifld":       {"ifld"},
	}))
}

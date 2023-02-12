package datacatalog

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/stretchr/testify/assert"
)

func TestUsecaseItem_DataCatalogs(t *testing.T) {
	assert.Equal(t, []DataCatalogItem{{
		ID:          "id",
		Name:        "name",
		Type:        "公園情報",
		TypeEn:      "park",
		Prefecture:  "pref",
		City:        "大阪市",
		Ward:        "北区",
		Format:      "3dtiles",
		Layers:      []string{"layers", "layers2"},
		URL:         "https://example.com/aaaaa/tileset.json",
		Description: "desc",
		Year:        2021,
		Config:      map[string]any{"a": "b"},
	}}, UsecaseItem{
		ID:          "id",
		Name:        "name",
		Type:        "公園",
		Prefecture:  "pref",
		CityName:    "大阪市/北区",
		OpenDataURL: "https://example.com",
		Description: "desc",
		Year:        "令和3年度以前",
		DataFormat:  "3D Tiles",
		DataLayers:  "layers, layers2",
		DataURL:     "https://example.com/aaaaa.zip",
		Config:      `{"a":"b"}`,
	}.DataCatalogs())
	assert.Equal(t, []DataCatalogItem{{
		ID:   "id",
		URL:  "url",
		City: "city",
		Ward: "ward",
		Year: 2022,
	}}, UsecaseItem{
		ID:       "id",
		DataURL:  "url2",
		CityName: "city",
		WardName: "ward",
		Data: &cms.PublicAsset{
			URL: "url",
		},
		Year: "令和4年度",
	}.DataCatalogs())
}

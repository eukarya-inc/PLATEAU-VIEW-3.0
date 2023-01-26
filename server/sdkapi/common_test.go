package sdkapi

import (
	"net/url"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestItems_DatasetResponse(t *testing.T) {
	assert.Equal(t, &DatasetResponse{
		Data: []*DatasetPref{
			{
				ID:    "東京都",
				Title: "東京都",
				Data: []DatasetCity{
					{
						ID:           "id",
						Title:        "千代田区",
						Description:  "description",
						FeatureTypes: []string{"bldg", "tran", "frn", "veg"},
					},
				},
			},
		},
	}, Items{
		{
			ID:          "id",
			Prefecture:  "東京都",
			CityName:    "千代田区",
			Description: "description",
			Bldg:        []cms.PublicAsset{{}},
			Tran:        []cms.PublicAsset{{}},
			Frn:         []cms.PublicAsset{{}},
			Veg:         []cms.PublicAsset{{}},
		},
	}.DatasetResponse())
}

func TestMaxLODColumns_Map(t *testing.T) {
	assert.Equal(t, MaxLODMap{
		"bldg": map[string]float64{
			"1": 1,
			"2": 1,
		},
		"veg": map[string]float64{
			"1": 2,
		},
		"frn": map[string]float64{
			"2": 2,
		},
	}, MaxLODColumns{
		{Code: "1", Type: "bldg", MaxLOD: 1},
		{Code: "2", Type: "bldg", MaxLOD: 1},
		{Code: "1", Type: "veg", MaxLOD: 2},
		{Code: "2", Type: "frn", MaxLOD: 2},
	}.Map())
}

func TestMaxLODMap_Files(t *testing.T) {
	assert.Equal(t, FilesResponse{
		"bldg": []File{
			{Code: "1", URL: "https://example.com/1_bldg_xxx.gml", MaxLOD: 1},
			{Code: "2", URL: "https://example.com/2_bldg_yyy.gml", MaxLOD: 1},
		},
		"veg": []File{
			{Code: "1", URL: "https://example.com/1_veg_zzz.gml", MaxLOD: 2},
		},
		"frn": nil,
	}, MaxLODMap{
		"bldg": map[string]float64{
			"2": 1,
			"1": 1,
		},
		"veg": map[string]float64{
			"1": 2,
		},
		"frn": map[string]float64{
			"2": 2,
		},
	}.Files([]*url.URL{
		lo.Must(url.Parse("https://example.com/1_bldg_xxx.gml")),
		lo.Must(url.Parse("https://example.com/2_bldg_yyy.gml")),
		lo.Must(url.Parse("https://example.com/1_veg_zzz.gml")),
	}))
}

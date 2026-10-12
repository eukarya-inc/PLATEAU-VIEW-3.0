package datacatalogv3

import (
	"testing"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToCityGMLs(t *testing.T) {
	regYear := 2023

	all := &AllData{
		City: []*CityItem{
			{
				ID:         "city1",
				Prefecture: "東京都",
				CityName:   "東京都23区",
				CityNameEn: "tokyo23ku",
				CityCode:   "13100",
				Spec:       "第3.3版",
				Year:       "2023",
				SDKPublic:  true,
				// city item reference wins over the back reference of index2
				GeospatialjpIndex: "index1",
				CodeLists: &cms.PublicAsset{
					Asset: cms.Asset{
						URL: "https://example.com/codelists.zip",
					},
				},
			},
		},
		GeospatialjpDataItems: []*GeospatialjpDataItem{
			{
				City:        "city1",
				CityGML:     "https://example.com/city1.gml",
				CityGMLSize: 100,
				MaxLOD:      "https://example.com/maxlod1.csv",
				Plateau:     "https://example.com/13100_3dtiles_mvt.zip",
				PlateauSize: 200,
				Related:     "https://example.com/13100_related.zip",
			},
		},
		GeospatialjpIndexItems: []*GeospatialjpIndexItem{
			{
				ID: "index1",
				Generics: []GeospatialjpIndexGeneric{
					{ID: "g1", Name: "その他", Asset: AssetRef{URL: "https://example.com/other.zip", Size: 30}},
					{ID: "g2", Name: "アセットなし"},
				},
			},
			{
				ID:   "index2",
				City: "city1",
				Generics: []GeospatialjpIndexGeneric{
					{ID: "g3", Name: "wrong", Asset: AssetRef{URL: "https://example.com/wrong.zip"}},
				},
			},
		},
		Plateau: map[string][]*PlateauFeatureItem{
			"bldg": {
				{
					City:    "city1",
					CityGML: "https://example.com/city3.gml",
				},
			},
			"ubld": {
				{
					City:    "city1",
					Sample:  true,
					CityGML: "https://example.com/city2.gml",
					MaxLOD:  "https://example.com/maxlod2.csv",
				},
			},
		},
		FeatureTypes: FeatureTypes{
			Plateau: []FeatureType{
				{
					Code: "bldg",
				},
				{
					Code: "ubld",
				},
			},
		},
	}

	gspatialjpURL := "https://www.geospatial.jp/ckan/dataset/plateau-13100-東京都23区-2023"
	expected := map[plateauapi.ID]*plateauapi.CityGMLDataset{
		"cg_13100": {
			ID:                   "cg_13100",
			Year:                 2023,
			RegistrationYear:     regYear,
			URL:                  "https://example.com/city1.gml",
			FileSize:             lo.ToPtr(100),
			GspatialjpDatasetURL: &gspatialjpURL,
			PrefectureID:         "p_13",
			PrefectureCode:       "13",
			CityID:               "c_13100",
			CityCode:             "13100",
			PlateauSpecMinorID:   "ps_3.3",
			FeatureTypes:         []string{"bldg", "ubld"},
			MetadataZipUrls:      []string{"https://example.com/codelists.zip"},
			GspatialjpFiles: []*plateauapi.GspatialjpFile{
				{Kind: "citygml", URL: "https://example.com/city1.gml", FileSize: 100},
				{Kind: "3dtiles_mvt", URL: "https://example.com/13100_3dtiles_mvt.zip", FileSize: 200},
				{Kind: "related", URL: "https://example.com/13100_related.zip"},
				{Kind: "other", Name: "その他", URL: "https://example.com/other.zip", FileSize: 30},
			},
			Admin: &plateauapi.Admin{
				CMSItemID: "city1",
				CityGMLURLs: []string{
					"https://example.com/city1.gml",
					"https://example.com/city2.gml",
				},
				MaxLODURLs: []string{
					"https://example.com/maxlod1.csv",
					"https://example.com/maxlod2.csv",
				},
			},
		},
	}

	res, warnings := toCityGMLs(all, regYear)
	assert.Nil(t, warnings)
	assert.Equal(t, expected, res)
}

func TestToCityGMLs_IndexBackReference(t *testing.T) {
	all := &AllData{
		City: []*CityItem{{ID: "city1", CityCode: "13100", Year: "2023"}},
		GeospatialjpDataItems: []*GeospatialjpDataItem{
			{City: "city1", CityGML: "https://example.com/city1.zip", MaxLOD: "https://example.com/maxlod.csv"},
		},
		GeospatialjpIndexItems: []*GeospatialjpIndexItem{
			{ID: "index1", City: "city1", Generics: []GeospatialjpIndexGeneric{
				{ID: "g1", Name: "その他", Asset: AssetRef{URL: "https://example.com/other.zip"}},
			}},
		},
	}

	res, _ := toCityGMLs(all, 2023)
	assert.Equal(t, []*plateauapi.GspatialjpFile{
		{Kind: "citygml", URL: "https://example.com/city1.zip"},
		{Kind: "other", Name: "その他", URL: "https://example.com/other.zip"},
	}, res["cg_13100"].GspatialjpFiles)
}

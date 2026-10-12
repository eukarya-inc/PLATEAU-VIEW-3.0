package datacatalog

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFetchSimplePlateauDatasets_GspatialjpFiles(t *testing.T) {
	gspatialjpURL := "https://www.geospatial.jp/ckan/dataset/plateau-13104-shinjuku-ku-2025"
	repoCtx := &plateauapi.InMemoryRepoContext{
		Name: "test",
		Areas: plateauapi.Areas{
			plateauapi.AreaTypePrefecture: {
				&plateauapi.Prefecture{ID: "p_13", Type: plateauapi.AreaTypePrefecture, Code: "13", Name: "東京都"},
			},
			plateauapi.AreaTypeCity: {
				&plateauapi.City{ID: "c_13104", Type: plateauapi.AreaTypeCity, Code: "13104", Name: "新宿区", PrefectureID: "p_13", PrefectureCode: "13"},
			},
		},
		PlateauSpecs: []plateauapi.PlateauSpec{
			{
				ID:           "ps_4",
				MajorVersion: 4,
				MinorVersions: []*plateauapi.PlateauSpecMinor{
					{ID: "ps_4.1", Version: "4.1", MajorVersion: 4, ParentID: "ps_4"},
				},
			},
		},
		CityGML: map[plateauapi.ID]*plateauapi.CityGMLDataset{
			"cg_13104": {
				ID:                   "cg_13104",
				Year:                 2025,
				RegistrationYear:     2025,
				PrefectureID:         "p_13",
				PrefectureCode:       "13",
				CityID:               "c_13104",
				CityCode:             "13104",
				PlateauSpecMinorID:   "ps_4.1",
				URL:                  "https://assets.example.com/assets/aa/citygml.zip",
				FileSize:             lo.ToPtr(100),
				GspatialjpDatasetURL: &gspatialjpURL,
				FeatureTypes:         []string{"bldg"},
				GspatialjpFiles: []*plateauapi.GspatialjpFile{
					// G空間情報センター may still list an older build than URL
					{Kind: plateauapi.GspatialjpFileKindCityGML, Name: "CityGML（v4）", URL: "https://assets.example.com/assets/bb/citygml_old.zip"},
					{Kind: plateauapi.GspatialjpFileKind3DTilesMVT, Name: "3D Tiles, MVT（v4）", URL: "https://assets.example.com/assets/cc/13104_3dtiles_mvt.zip", FileSize: 2000},
					{Kind: plateauapi.GspatialjpFileKindOther, Name: "その他", URL: "https://assets.example.com/assets/dd/other.zip"},
				},
			},
		},
	}

	// The data must survive the datacatalog cache (--generate-datacatalog)
	// round trip, since production servers load the repo from that JSON.
	b, err := json.Marshal(repoCtx)
	require.NoError(t, err)
	var loaded plateauapi.InMemoryRepoContext
	require.NoError(t, json.Unmarshal(b, &loaded))

	res, err := FetchSimplePlateauDatasets(context.Background(), plateauapi.NewInMemoryRepo(&loaded), "")
	require.NoError(t, err)
	require.Len(t, res.CityGML, 1)

	got := res.CityGML[0]
	assert.Equal(t, &gspatialjpURL, got.GspatialjpDatasetURL)
	assert.Equal(t, []*SimpleGspatialjpFile{
		{Kind: "citygml", Name: "CityGML（v4）", URL: "https://assets.example.com/assets/bb/citygml_old.zip"},
		{Kind: "3dtiles_mvt", Name: "3D Tiles, MVT（v4）", URL: "https://assets.example.com/assets/cc/13104_3dtiles_mvt.zip", FileSize: lo.ToPtr[int64](2000)},
		{Kind: "other", Name: "その他", URL: "https://assets.example.com/assets/dd/other.zip"},
	}, got.GspatialjpFiles)
	assert.Equal(t, "4.1", got.Spec)

	j, err := json.Marshal(got)
	require.NoError(t, err)
	assert.Contains(t, string(j), `"gspatialjp_files":[{"kind":"citygml","name":"CityGML（v4）","url":"https://assets.example.com/assets/bb/citygml_old.zip"},{"kind":"3dtiles_mvt","name":"3D Tiles, MVT（v4）","url":"https://assets.example.com/assets/cc/13104_3dtiles_mvt.zip","file_size":2000},`)
}

func TestSimpleGspatialjpFiles_EmptyIsArray(t *testing.T) {
	files := simpleGspatialjpFiles(nil)
	assert.NotNil(t, files)

	b, err := json.Marshal(&SimpleCityGMLDataset{GspatialjpFiles: files})
	require.NoError(t, err)
	assert.Contains(t, string(b), `"gspatialjp_files":[]`)
	assert.Contains(t, string(b), `"gspatialjp_dataset_url":null`)
}

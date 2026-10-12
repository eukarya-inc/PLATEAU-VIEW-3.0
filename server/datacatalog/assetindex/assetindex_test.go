package assetindex

import (
	"bytes"
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	host  = "https://assets.cms.plateau.reearth.io"
	uuid1 = "ef/b49016-be67-4c5e-a3b2-1234567890ab"
	uuid2 = "01/456789-abcd-ef01-2345-6789abcdef01"
	uuid3 = "aa/aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
	uuid4 = "bb/bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
	uuid5 = "cc/cccccc-cccc-cccc-cccc-cccccccccccc"
	uuid6 = "dd/dddddd-dddd-dddd-dddd-dddddddddddd"
)

func TestExtractAssetUUID(t *testing.T) {
	tests := []struct {
		name string
		url  string
		uuid string
		base string
	}{
		{
			name: "zip",
			url:  host + "/assets/" + uuid1 + "/13104_shinjuku-ku_pref_2025_3dtiles_mvt_1_op.zip",
			uuid: uuid1,
			base: host + "/assets/" + uuid1,
		},
		{
			name: "inside extracted zip",
			url:  host + "/assets/" + uuid1 + "/13104_bldg_lod2/tileset.json",
			uuid: uuid1,
			base: host + "/assets/" + uuid1,
		},
		{
			name: "query and fragment",
			url:  host + "/assets/" + uuid1 + "/a/{z}/{x}/{y}.mvt?foo=bar#x",
			uuid: uuid1,
			base: host + "/assets/" + uuid1,
		},
		{
			name: "uppercase is normalized",
			url:  host + "/assets/EF/B49016-BE67-4C5E-A3B2-1234567890AB/a.zip",
			uuid: uuid1,
			base: host + "/assets/" + uuid1,
		},
		{
			name: "asset directory itself",
			url:  host + "/assets/" + uuid1,
			uuid: uuid1,
			base: host + "/assets/" + uuid1,
		},
		{name: "not under /assets", url: host + "/foo/" + uuid1 + "/a.zip"},
		{name: "assets not first segment", url: "https://storage.googleapis.com/bucket/assets/" + uuid1 + "/a.zip"},
		{name: "short uuid", url: host + "/assets/ef/b49016/a.zip"},
		{name: "non hex", url: host + "/assets/zz/b49016-be67-4c5e-a3b2-1234567890ab/a.zip"},
		{name: "external url", url: "https://example.com/tiles/{z}/{x}/{y}.png"},
		{name: "relative", url: "/assets/" + uuid1 + "/a.zip"},
		{name: "data url", url: "data:text/markdown,abc"},
		{name: "empty", url: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			uuid, base, ok := ExtractAssetUUID(tt.url)
			assert.Equal(t, tt.uuid != "", ok)
			assert.Equal(t, tt.uuid, uuid)
			assert.Equal(t, tt.base, base)
		})
	}
}

func testRepo() plateauapi.Repo {
	prefCode := plateauapi.AreaCode("13")
	cityCode := plateauapi.AreaCode("13104")
	gspatialjpURL := "https://www.geospatial.jp/ckan/dataset/plateau-13104-shinjuku-ku-2025"

	return plateauapi.NewInMemoryRepo(&plateauapi.InMemoryRepoContext{
		Name: "plateau-2025",
		Areas: plateauapi.Areas{
			plateauapi.AreaTypePrefecture: {
				&plateauapi.Prefecture{ID: "p_13", Type: plateauapi.AreaTypePrefecture, Code: "13", Name: "東京都"},
			},
			plateauapi.AreaTypeCity: {
				&plateauapi.City{ID: "c_13104", Type: plateauapi.AreaTypeCity, Code: "13104", Name: "新宿区", PrefectureID: "p_13", PrefectureCode: "13"},
			},
		},
		DatasetTypes: plateauapi.DatasetTypes{
			plateauapi.DatasetTypeCategoryPlateau: {
				&plateauapi.PlateauDatasetType{ID: "dt_bldg_4", Code: "bldg", Name: "建築物モデル", Category: plateauapi.DatasetTypeCategoryPlateau},
			},
			plateauapi.DatasetTypeCategoryRelated: {
				&plateauapi.RelatedDatasetType{ID: "dt_shelter", Code: "shelter", Name: "避難施設情報", Category: plateauapi.DatasetTypeCategoryRelated},
			},
		},
		PlateauSpecs: []plateauapi.PlateauSpec{
			{ID: "ps_4", MajorVersion: 4, MinorVersions: []*plateauapi.PlateauSpecMinor{
				{ID: "ps_4.1", Version: "4.1", MajorVersion: 4, ParentID: "ps_4"},
			}},
		},
		Datasets: plateauapi.Datasets{
			plateauapi.DatasetTypeCategoryPlateau: {
				&plateauapi.PlateauDataset{
					ID:                 "d_13104_bldg",
					Name:               "建築物モデル（新宿区）",
					Year:               2025,
					RegisterationYear:  2025,
					PrefectureID:       lo.ToPtr(plateauapi.ID("p_13")),
					PrefectureCode:     &prefCode,
					CityID:             lo.ToPtr(plateauapi.ID("c_13104")),
					CityCode:           &cityCode,
					TypeID:             "dt_bldg_4",
					TypeCode:           "bldg",
					PlateauSpecMinorID: "ps_4.1",
					Admin:              &plateauapi.Admin{Stage: "beta"},
					Items: []*plateauapi.PlateauDatasetItem{
						{
							ID: "di_13104_bldg_lod2", Name: "LOD2", Format: plateauapi.DatasetFormatCesium3dtiles,
							URL:      host + "/assets/" + uuid1 + "/13104_bldg_lod2/tileset.json",
							FileSize: lo.ToPtr(123), Lod: lo.ToPtr(2), Texture: lo.ToPtr(plateauapi.TextureTexture),
							ParentID: "d_13104_bldg",
						},
						{
							// the same zip extracted twice: one row, two refs
							ID: "di_13104_bldg_lod2_no_texture", Name: "LOD2（テクスチャなし）", Format: plateauapi.DatasetFormatCesium3dtiles,
							URL: host + "/assets/" + uuid1 + "/13104_bldg_lod2_no_texturemap/tileset.json",
							Lod: lo.ToPtr(2), Texture: lo.ToPtr(plateauapi.TextureNone),
							ParentID: "d_13104_bldg",
						},
					},
				},
			},
			plateauapi.DatasetTypeCategoryRelated: {
				&plateauapi.RelatedDataset{
					ID:                "d_13104_shelter",
					Name:              "避難施設情報（新宿区）",
					Year:              2025,
					RegisterationYear: 2025,
					PrefectureCode:    &prefCode,
					CityCode:          &cityCode,
					TypeID:            "dt_shelter",
					TypeCode:          "shelter",
					Items: []*plateauapi.RelatedDatasetItem{
						{
							ID: "di_13104_shelter", Format: plateauapi.DatasetFormatCzml,
							URL:            host + "/assets/" + uuid2 + "/13104_shelter.czml",
							OriginalURL:    lo.ToPtr(host + "/assets/" + uuid3 + "/13104_shelter.geojson"),
							OriginalFormat: lo.ToPtr(plateauapi.DatasetFormatGeojson),
						},
					},
				},
			},
			plateauapi.DatasetTypeCategoryGeneric: {
				&plateauapi.GenericDataset{
					ID:       "d_generic",
					Name:     "外部タイル",
					TypeCode: "usecase",
					Items: []*plateauapi.GenericDatasetItem{
						{ID: "di_generic", Format: plateauapi.DatasetFormatTiles, URL: "https://example.com/{z}/{x}/{y}.png"},
					},
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
				URL:                  host + "/assets/" + uuid4 + "/13104_shinjuku-ku_pref_2025_citygml_1_op.zip",
				FileSize:             lo.ToPtr(1000),
				GspatialjpDatasetURL: &gspatialjpURL,
				MetadataZipUrls:      []string{host + "/assets/" + uuid6 + "/13104_codelists.zip"},
				Admin: &plateauapi.Admin{
					CityGMLURLs: []string{host + "/assets/" + uuid4 + "/13104_shinjuku-ku_pref_2025_citygml_1_op.zip"},
					MaxLODURLs:  []string{host + "/assets/" + uuid6 + "/maxlod.csv"},
				},
				GspatialjpFiles: []*plateauapi.GspatialjpFile{
					{Kind: plateauapi.GspatialjpFileKindCityGML, URL: host + "/assets/" + uuid4 + "/13104_shinjuku-ku_pref_2025_citygml_1_op.zip", FileSize: 1000},
					{Kind: plateauapi.GspatialjpFileKind3DTilesMVT, URL: host + "/assets/" + uuid5 + "/13104_shinjuku-ku_pref_2025_3dtiles_mvt_1_op.zip", FileSize: 2000},
				},
			},
		},
	})
}

func TestBuild(t *testing.T) {
	res, err := Build(context.Background(), []Project{{Name: "plateau-2025", Repo: testRepo()}})
	require.NoError(t, err)

	// one row per uuid, sorted
	uuids := lo.Map(res.Rows, func(r *Row, _ int) string { return r.UUID })
	assert.Equal(t, []string{uuid2, uuid3, uuid4, uuid5, uuid6, uuid1}, uuids)
	assert.Equal(t, 1, res.Skipped) // the external generic tile URL
	assert.Equal(t, 8, res.Refs)

	rows := lo.SliceToMap(res.Rows, func(r *Row) (string, *Row) { return r.UUID, r })

	bldg := rows[uuid1]
	assert.Equal(t, host+"/assets/"+uuid1, bldg.URL)
	require.Len(t, bldg.Refs, 2)
	assert.Equal(t, &Ref{
		Kind:             KindPlateauDataset,
		Project:          "plateau-2025",
		Stage:            lo.ToPtr("beta"),
		DatasetID:        lo.ToPtr("d_13104_bldg"),
		DatasetName:      lo.ToPtr("建築物モデル（新宿区）"),
		ItemID:           lo.ToPtr("di_13104_bldg_lod2"),
		ItemName:         lo.ToPtr("LOD2"),
		TypeCode:         lo.ToPtr("bldg"),
		Type:             lo.ToPtr("建築物モデル"),
		PrefCode:         lo.ToPtr("13"),
		Pref:             lo.ToPtr("東京都"),
		CityCode:         lo.ToPtr("13104"),
		City:             lo.ToPtr("新宿区"),
		Year:             lo.ToPtr(2025),
		RegistrationYear: lo.ToPtr(2025),
		Spec:             lo.ToPtr("4.1"),
		Format:           lo.ToPtr("CESIUM3DTILES"),
		LOD:              lo.ToPtr("2"),
		Texture:          lo.ToPtr(true),
		FileSize:         lo.ToPtr[int64](123),
		URL:              host + "/assets/" + uuid1 + "/13104_bldg_lod2/tileset.json",
	}, bldg.Refs[0])
	assert.Equal(t, lo.ToPtr("di_13104_bldg_lod2_no_texture"), bldg.Refs[1].ItemID)
	assert.Equal(t, lo.ToPtr(false), bldg.Refs[1].Texture)

	assert.Equal(t, []string{KindRelatedDataset}, kinds(rows[uuid2]))
	assert.Equal(t, []string{KindRelatedDatasetOriginal}, kinds(rows[uuid3]))
	assert.Equal(t, lo.ToPtr("GEOJSON"), rows[uuid3].Refs[0].Format)
	assert.Equal(t, lo.ToPtr("ga"), rows[uuid3].Refs[0].Stage)
	assert.Nil(t, rows[uuid3].Refs[0].Spec)

	// the G空間 CityGML zip is the CityGML entry itself, so it is not repeated
	assert.Equal(t, []string{KindCityGML}, kinds(rows[uuid4]))
	assert.Equal(t, lo.ToPtr("cg_13104"), rows[uuid4].Refs[0].DatasetID)
	assert.Equal(t, lo.ToPtr[int64](1000), rows[uuid4].Refs[0].FileSize)
	assert.Equal(t, []string{KindGspatialjp3DTilesMVT}, kinds(rows[uuid5]))
	assert.Equal(t, lo.ToPtr[int64](2000), rows[uuid5].Refs[0].FileSize)
	assert.Equal(t, lo.ToPtr("新宿区"), rows[uuid5].Refs[0].City)
	assert.Equal(t, []string{KindCityGMLMaxLOD, KindCityGMLMetadata}, kinds(rows[uuid6]))
}

func TestBuild_MultipleProjects(t *testing.T) {
	repo := testRepo()
	res, err := Build(context.Background(), []Project{
		{Name: "plateau-2025", Repo: repo},
		{Name: "plateau-2025", Repo: repo}, // identical refs collapse
		{Name: "plateau-2025-copy", Repo: repo},
		{Name: "nil", Repo: nil},
	})
	require.NoError(t, err)
	assert.Len(t, res.Rows, 6)
	assert.Equal(t, 16, res.Refs)
	for _, r := range res.Rows {
		for i := 1; i < len(r.Refs); i++ {
			assert.False(t, refLess(r.Refs[i], r.Refs[i-1]), "refs must be sorted")
		}
	}
}

func TestWriteNDJSON(t *testing.T) {
	res, err := Build(context.Background(), []Project{{Name: "plateau-2025", Repo: testRepo()}})
	require.NoError(t, err)

	var buf bytes.Buffer
	require.NoError(t, res.WriteNDJSON(&buf))
	lines := strings.Split(strings.TrimSuffix(buf.String(), "\n"), "\n")
	assert.Len(t, lines, len(res.Rows))

	var first map[string]any
	require.NoError(t, json.Unmarshal([]byte(lines[0]), &first))
	assert.Equal(t, uuid2, first["uuid"])
	ref := first["refs"].([]any)[0].(map[string]any)
	// absent values are explicit nulls so the schema is stable
	assert.Contains(t, ref, "ward_code")
	assert.Nil(t, ref["ward_code"])
	assert.Contains(t, ref, "lod")
	// no HTML escaping of URLs
	assert.NotContains(t, buf.String(), `&`)

	// deterministic output
	var buf2 bytes.Buffer
	res2, err := Build(context.Background(), []Project{{Name: "plateau-2025", Repo: testRepo()}})
	require.NoError(t, err)
	require.NoError(t, res2.WriteNDJSON(&buf2))
	assert.Equal(t, buf.String(), buf2.String())
}

func kinds(r *Row) []string {
	if r == nil {
		return nil
	}
	return lo.Map(r.Refs, func(ref *Ref, _ int) string { return ref.Kind })
}

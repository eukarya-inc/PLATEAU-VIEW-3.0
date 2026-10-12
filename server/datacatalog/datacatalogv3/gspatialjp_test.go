package datacatalogv3

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/cmsintegration/ckan"
	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const nerimaCityGML = "https://assets.cms.plateau.reearth.io/assets/44/31ccf1-036e-4a8f-9cdb-4481b85f89cc/13120_nerima-ku_pref_2025_citygml_1_op.zip"
const nerima3DTiles = "https://assets.cms.plateau.reearth.io/assets/46/b51ae9-d078-45c8-9677-e4dc262f4d47/13120_nerima-ku_pref_2025_3dtiles_mvt_1_op.zip"
const nerimaRelated = "https://assets.cms.plateau.reearth.io/assets/b2/9a7ac3-0000-0000-0000-000000000000/13120_nerima-ku_2025_related.zip"
const nerimaIndexMap = "https://assets.cms.plateau.reearth.io/assets/01/b5f8f3-0000-0000-0000-000000000000/13120_indexmap_op.pdf"

func TestGspatialjpFiles(t *testing.T) {
	pkg := &GspatialjpPackage{
		Name: "plateau-13120-nerima-ku-2025",
		Resources: []ckan.Resource{
			{Name: "データ目録（v5）", URL: "data:text/markdown;base64,AAAA", Format: "text/markdown"},
			{Name: "索引図（v5）", URL: nerimaIndexMap, Format: "PDF"},
			{Name: "CityGML（v5）", URL: nerimaCityGML, Format: "ZIP"},
			{Name: "3D Tiles, MVT（v5）", URL: nerima3DTiles, Format: "ZIP"},
			{Name: "関連データセット（v5）", URL: nerimaRelated, Format: "ZIP"},
			{Name: "GeoTIFF(v5)", URL: "https://example.com/ortho.zip", Format: "ZIP"},
			{Name: "利用規約", URL: "https://example.com/terms.pdf", Format: "PDF"},
			{Name: "浸水継続時間可視化データ(筑後川水系宝満川)", URL: "https://example.com/other.zip", Format: "ZIP"},
			{Name: "URLなし", URL: ""},
			// other versions
			{Name: "CityGML（v4）", URL: "https://example.com/citygml_v4.zip", Format: "ZIP"},
			{Name: "関連データセット(v2)", URL: "https://example.com/related_v2.zip", Format: "ZIP"},
			{Name: "ユースケースデータ（V2）", URL: "https://example.com/uc.zip", Format: "ZIP"},
			// the first release (v1) has no version suffix
			{Name: "データ目録", URL: "https://example.com/index.xlsx", Format: "XLSX"},
			{Name: "図郭マップ", URL: "https://example.com/map.pdf", Format: "PDF"},
			{Name: "CityGML", URL: "https://example.com/citygml_v1.zip", Format: "ZIP"},
			{Name: "3D Tiles, GeoJson, MVT, Shape", URL: "https://example.com/3dtiles_v1.zip", Format: "ZIP"},
			{Name: "ファイルジオデータベース（防災）", URL: "https://example.com/fgdb.7z", Format: "7z"},
		},
	}

	sizes := map[string]int64{
		nerima3DTiles:                        2000,
		"https://example.com/citygml_v4.zip": 1,
	}

	assert.Equal(t, []*plateauapi.GspatialjpFile{
		{Kind: "citygml", Name: "CityGML（v5）", URL: nerimaCityGML},
		{Kind: "3dtiles_mvt", Name: "3D Tiles, MVT（v5）", URL: nerima3DTiles, FileSize: 2000},
		{Kind: "related", Name: "関連データセット（v5）", URL: nerimaRelated},
		{Kind: "other", Name: "GeoTIFF(v5)", URL: "https://example.com/ortho.zip"},
		{Kind: "other", Name: "利用規約", URL: "https://example.com/terms.pdf"},
		{Kind: "other", Name: "浸水継続時間可視化データ(筑後川水系宝満川)", URL: "https://example.com/other.zip"},
	}, gspatialjpFiles(pkg, 5, sizes))

	assert.Equal(t, []*plateauapi.GspatialjpFile{
		{Kind: "other", Name: "利用規約", URL: "https://example.com/terms.pdf"},
		{Kind: "other", Name: "浸水継続時間可視化データ(筑後川水系宝満川)", URL: "https://example.com/other.zip"},
		{Kind: "citygml", Name: "CityGML（v4）", URL: "https://example.com/citygml_v4.zip", FileSize: 1},
	}, gspatialjpFiles(pkg, 4, sizes))

	assert.Nil(t, gspatialjpFiles(nil, 5, nil))
}

func TestGspatialjpKeyFromPackageName(t *testing.T) {
	tests := []struct {
		name string
		want gspatialjpKey
		ok   bool
	}{
		{"plateau-13120-nerima-ku-2025", gspatialjpKey{"13120", 2025}, true},
		{"plateau-14100-yokohama-city-2020", gspatialjpKey{"14100", 2020}, true},
		{"plateau-tokyo23ku-2022", gspatialjpKey{"13100", 2022}, true},
		{"plateau-tokyo23ku", gspatialjpKey{}, false},
		{"plateau-tokyo23ku-2023-lod4", gspatialjpKey{}, false},
		{"plateau-17206-kaga-shi", gspatialjpKey{}, false},
		{"plateau-uc23-01", gspatialjpKey{}, false},
	}
	for _, tt := range tests {
		got, ok := gspatialjpKeyFromPackageName(tt.name)
		assert.Equal(t, tt.ok, ok, tt.name)
		assert.Equal(t, tt.want, got, tt.name)
	}
}

func TestSpecMajorVersion(t *testing.T) {
	assert.Equal(t, 5, specMajorVersion("第5.0版"))
	assert.Equal(t, 4, specMajorVersion("第4.1版"))
	assert.Equal(t, 3, specMajorVersion("3.3"))
	assert.Equal(t, 0, specMajorVersion(""))
}

func TestGspatialjp_Packages(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	const base = "https://ckan.example.com/ckan"
	searchURL := base + "/api/3/action/package_search"
	httpmock.RegisterResponder("GET", searchURL, func(req *http.Request) (*http.Response, error) {
		q := req.URL.Query()
		assert.Equal(t, "organization:toshi", q.Get("fq"))
		assert.Equal(t, "id asc", q.Get("sort"))
		assert.Equal(t, "1000", q.Get("rows"))
		assert.Equal(t, "name,num_resources,res_name,res_url,res_format", q.Get("fl"))

		// two pages
		var results []any
		switch q.Get("start") {
		case "":
			results = []any{
				map[string]any{"name": "plateau-uc23-01", "num_resources": []int{1}, "res_name": []string{"a"}, "res_url": []string{"https://example.com/a"}, "res_format": []string{"ZIP"}},
				map[string]any{
					"name":          "plateau-13120-nerima-ku-2025",
					"num_resources": []int{4},
					"res_name":      []string{"データ目録（v5）", "索引図（v5）", "CityGML（v5）", "3D Tiles, MVT（v5）"},
					"res_url":       []string{"data:text/markdown;base64,AAAA", nerimaIndexMap, nerimaCityGML, nerima3DTiles},
					"res_format":    []string{"text/markdown", "PDF", "ZIP", "ZIP"},
				},
			}
		case "2":
			// a resource without URL is dropped from res_url, so the arrays
			// cannot be paired up and the package is read with package_show
			results = []any{
				map[string]any{
					"name":          "plateau-26100-kyoto-shi-2025",
					"num_resources": 2,
					"res_name":      []string{"データ目録（v5）", "CityGML（v5）"},
					"res_url":       []string{"https://example.com/kyoto.zip"},
					"res_format":    []string{"text/markdown", "ZIP"},
				},
			}
		default:
			t.Errorf("unexpected start: %s", q.Get("start"))
		}
		return httpmock.NewJsonResponse(200, map[string]any{
			"success": true,
			"result":  map[string]any{"count": 3, "results": results},
		})
	})
	httpmock.RegisterResponder("GET", base+"/api/3/action/package_show", func(req *http.Request) (*http.Response, error) {
		assert.Equal(t, "plateau-26100-kyoto-shi-2025", req.URL.Query().Get("id"))
		return httpmock.NewJsonResponse(200, map[string]any{
			"success": true,
			"result": map[string]any{
				"name": "plateau-26100-kyoto-shi-2025",
				"resources": []any{
					map[string]any{"name": "データ目録（v5）", "url": ""},
					map[string]any{"name": "CityGML（v5）", "url": "https://example.com/kyoto.zip", "format": "ZIP"},
				},
			},
		})
	})

	g, err := NewGspatialjp(base + "/")
	require.NoError(t, err)
	now := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	g.now = func() time.Time { return now }

	pkgs, err := g.Packages(context.Background())
	require.NoError(t, err)
	assert.Empty(t, pkgs.Warnings)

	nerima := pkgs.Find("13120", 2025)
	require.NotNil(t, nerima)
	assert.Equal(t, "https://ckan.example.com/ckan/dataset/plateau-13120-nerima-ku-2025", pkgs.DatasetURL(nerima))
	assert.Equal(t, []*plateauapi.GspatialjpFile{
		{Kind: "citygml", Name: "CityGML（v5）", URL: nerimaCityGML},
		{Kind: "3dtiles_mvt", Name: "3D Tiles, MVT（v5）", URL: nerima3DTiles},
	}, gspatialjpFiles(nerima, 5, nil))

	kyoto := pkgs.Find("26100", 2025)
	require.NotNil(t, kyoto)
	assert.Equal(t, []*plateauapi.GspatialjpFile{
		{Kind: "citygml", Name: "CityGML（v5）", URL: "https://example.com/kyoto.zip"},
	}, gspatialjpFiles(kyoto, 5, nil))

	assert.Nil(t, pkgs.Find("13120", 2024))
	assert.Len(t, pkgs.packages, 2)

	// memoised
	calls := httpmock.GetTotalCallCount()
	_, err = g.Packages(context.Background())
	require.NoError(t, err)
	assert.Equal(t, calls, httpmock.GetTotalCallCount())

	// refetched after the TTL
	now = now.Add(gspatialjpTTL)
	_, err = g.Packages(context.Background())
	require.NoError(t, err)
	assert.Greater(t, httpmock.GetTotalCallCount(), calls)
}

func TestGspatialjp_Packages_Error(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	const base = "https://ckan.example.com"
	httpmock.RegisterResponder("GET", base+"/api/3/action/package_search",
		httpmock.NewJsonResponderOrPanic(400, map[string]any{"success": false, "error": map[string]any{"message": "bad"}}))

	g, err := NewGspatialjp(base)
	require.NoError(t, err)
	pkgs, err := g.Packages(context.Background())
	assert.ErrorContains(t, err, "bad")
	assert.Nil(t, pkgs)
	// a nil result finds nothing
	assert.Nil(t, pkgs.Find("13120", 2025))
}

func TestCMS_GetAll_GspatialjpFailure(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()
	mockCMS(t)
	httpmock.RegisterResponder("GET", "https://ckan.example.com/api/3/action/package_search",
		httpmock.NewStringResponder(400, `{"success": false, "error": {"message": "bad request"}}`))

	ctx := context.Background()
	repos, cms := newTestRepos(t, ctx)
	g := lo.Must(NewGspatialjp("https://ckan.example.com"))
	repos.SetGspatialjp(g)

	// the catalog is built and the failure is only a warning
	require.NoError(t, repos.Prepare(plateauCMSContext(ctx), "prj", 2023, true, cms))
	assert.Contains(t, repos.Warnings("prj"), "gspatialjp: failed to get G空間情報センター datasets: failed to search packages: status code 400: bad request")
	assert.NotNil(t, repos.Repo("prj"))
}

package datacatalog

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFetcher(t *testing.T) {
	const base, prj = "", ""

	if base == "" || prj == "" {
		t.SkipNow()
	}
	f := lo.Must(NewFetcher(nil, base))
	cmsres := lo.Must(f.Do(context.Background(), prj))
	res := cmsres.All()
	// item, _ := lo.Find(cmsres.Plateau, func(i PlateauItem) bool { return i.CityName == "" })
	// res := item.AllDataCatalogItems(item.IntermediateItem())
	// t.Log(string(lo.Must(json.MarshalIndent(res, "", "  "))))
	lo.Must0(os.WriteFile("datacatalog.json", lo.Must(json.MarshalIndent(res, "", "  ")), 0644))
}

func TestFetcher_Do(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]string{"id": "x"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]string{"id": "y"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]string{"id": "z"}},
		"totalCount": 1,
	})))

	ctx := context.Background()
	r, err := lo.Must(NewFetcher(nil, "https://example.com")).Do(ctx, "ppp")
	assert.Equal(t, ResponseAll{
		Plateau: []PlateauItem{{ID: "x"}},
		Usecase: []UsecaseItem{{ID: "y", Type: "ユースケース"}, {ID: "z"}},
	}, r)
	assert.NoError(t, err)
}

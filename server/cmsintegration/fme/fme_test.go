package fme

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

var _ Interface = (*FME)(nil)

func TestFME(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	ctx := context.Background()
	wantReq := Request{
		ID:     "xxx",
		Target: "target",
		PRCS:   "000",
	}

	// valid
	calls := mockFMEServer("http://fme.example.com", "TOKEN", wantReq, "https://example.com")
	f := lo.Must(New("http://fme.example.com", "TOKEN", "https://example.com", false))
	req := wantReq
	assert.NoError(t, f.CheckQuality(ctx, req))
	assert.NoError(t, f.ConvertAll(ctx, req))
	assert.NoError(t, f.CheckQualityAndConvertAll(ctx, req))
	assert.Equal(t, 1, calls("quality-check"))
	assert.Equal(t, 1, calls("convert-all"))
	assert.Equal(t, 1, calls("quality-check-and-convert-all"))

	// invalid token
	httpmock.Reset()
	calls = mockFMEServer("http://fme.example.com", "TOKEN", wantReq, "https://example.com")
	f = lo.Must(New("http://fme.example.com", "TOKEN2", "https://example.com", false))
	req = wantReq
	assert.ErrorContains(t, f.CheckQuality(ctx, req), "failed to request: code=401")
	assert.ErrorContains(t, f.ConvertAll(ctx, req), "failed to request: code=401")
	assert.ErrorContains(t, f.CheckQualityAndConvertAll(ctx, req), "failed to request: code=401")
	assert.Equal(t, 1, calls("quality-check"))
	assert.Equal(t, 1, calls("convert-all"))
	assert.Equal(t, 1, calls("quality-check-and-convert-all"))

	// invalid queries
	httpmock.Reset()
	calls = mockFMEServer("http://fme.example.com", "TOKEN", wantReq, "https://example.com")
	f = lo.Must(New("http://fme.example.com", "TOKEN", "https://example.com", false))
	req = Request{
		ID:     wantReq.ID,
		Target: "target!",
		PRCS:   wantReq.PRCS,
	}
	assert.ErrorContains(t, f.CheckQuality(ctx, req), "failed to request: code=400")
	assert.ErrorContains(t, f.ConvertAll(ctx, req), "failed to request: code=400")
	assert.ErrorContains(t, f.CheckQualityAndConvertAll(ctx, req), "failed to request: code=400")
	assert.Equal(t, 1, calls("quality-check"))
	assert.Equal(t, 1, calls("convert-all"))
	assert.Equal(t, 1, calls("quality-check-and-convert-all"))
}

func mockFMEServer(host, token string, r Request, resultURL string) func(string) int {
	u := host + "/fmejobsubmitter/plateau2022-cms/"

	responder := func(req *http.Request) (*http.Response, error) {
		if t := parseFMEToken(req); t != token {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, map[string]any{
				"statusInfo": map[string]any{
					"message": "failure",
					"status":  "failure",
				},
			})
		}

		q := req.URL.Query()
		if q.Get("opt_servicemode") != "async" ||
			r.ID != q.Get("id") ||
			r.PRCS != q.Get("prcs") ||
			resultURL != q.Get("resultUrl") ||
			r.Target != q.Get("target") {
			return httpmock.NewJsonResponse(http.StatusBadRequest, map[string]any{
				"statusInfo": map[string]any{
					"message": "failure",
					"status":  "failure",
				},
			})
		}

		return httpmock.NewJsonResponse(200, map[string]any{
			"statusInfo": map[string]any{
				"message": "success",
				"status":  "success",
			},
		})
	}

	httpmock.RegisterResponder("POST", u+"quality-check.fmw", responder)
	httpmock.RegisterResponder("POST", u+"convert-all.fmw", responder)
	httpmock.RegisterResponder("POST", u+"quality-check-and-convert-all.fmw", responder)

	return func(ws string) int {
		return httpmock.GetCallCountInfo()[fmt.Sprintf("POST %s%s.fmw", u, ws)]
	}
}

func parseFMEToken(r *http.Request) string {
	aut := r.Header.Get("Authorization")
	_, token, found := strings.Cut(aut, "fmetoken token=")
	if !found {
		return ""
	}
	return token
}

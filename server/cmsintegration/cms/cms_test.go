package cms

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

var _ Interface = (*CMS)(nil)

func TestCMS(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	ctx := context.Background()

	// valid
	call := mockCMS("http://fme.example.com", "TOKEN")
	f := lo.Must(New("http://fme.example.com", "TOKEN"))
	assetID, err := f.UploadAsset(ctx, "ppp", "aaa")
	assert.NoError(t, err)
	assert.Equal(t, "idid", assetID)
	assert.NoError(t, f.UpdateItem(ctx, "a", nil))
	assert.NoError(t, f.Comment(ctx, "c", "comment"))
	a, err := f.Asset(ctx, "a")
	assert.NoError(t, err)
	assert.Equal(t, &Asset{ID: "a", URL: "url"}, a)
	assert.Equal(t, 1, call("POST /api/projects/ppp/assets"))
	assert.Equal(t, 1, call("PATCH /api/items/a"))
	assert.Equal(t, 1, call("POST /api/assets/c/comments"))
	assert.Equal(t, 1, call("GET /api/assets/a"))

	// invalid token
	httpmock.Reset()
	call = mockCMS("http://fme.example.com", "TOKEN")
	f = lo.Must(New("http://fme.example.com", "TOKEN2"))
	assetID, err = f.UploadAsset(ctx, "ppp", "aaa")
	assert.ErrorContains(t, err, "failed to request: code=401")
	assert.Equal(t, "", assetID)
	assert.ErrorContains(t, f.UpdateItem(ctx, "a", nil), "failed to request: code=401")
	assert.ErrorContains(t, f.Comment(ctx, "c", "comment"), "failed to request: code=401")
	_, err = f.Asset(ctx, "a")
	assert.ErrorContains(t, err, "failed to request: code=401")
	assert.Equal(t, 1, call("POST /api/projects/ppp/assets"))
	assert.Equal(t, 1, call("PATCH /api/items/a"))
	assert.Equal(t, 1, call("POST /api/assets/c/comments"))
	assert.Equal(t, 1, call("GET /api/assets/a"))
}

func mockCMS(host, token string) func(string) int {
	responder := func(req *http.Request) (*http.Response, error) {
		if t := parseToken(req); t != token {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, "unauthorized")
		}

		if req.Header.Get("Content-Type") != "application/json" {
			return httpmock.NewJsonResponse(http.StatusUnsupportedMediaType, "unsupported media type")
		}

		res := map[string]string{}
		p := req.URL.Path
		if req.Method == "POST" && p == "/api/projects/ppp/assets" {
			res["id"] = "idid"
		} else if req.Method == "GET" && p == "/api/assets/a" {
			res["id"] = "a"
			res["url"] = "url"
		}

		return httpmock.NewJsonResponse(http.StatusOK, res)
	}

	httpmock.RegisterResponder("PATCH", host+"/api/items/a", responder)
	httpmock.RegisterResponder("POST", host+"/api/projects/ppp/assets", responder)
	httpmock.RegisterResponder("POST", host+"/api/assets/c/comments", responder)
	httpmock.RegisterResponder("GET", host+"/api/assets/a", responder)

	return func(p string) int {
		b, a, _ := strings.Cut(p, " ")
		return httpmock.GetCallCountInfo()[b+" "+host+a]
	}
}

func parseToken(r *http.Request) string {
	aut := r.Header.Get("Authorization")
	_, token, found := strings.Cut(aut, "Bearer ")
	if !found {
		return ""
	}
	return token
}

package cms

import (
	"context"
	"io"
	"net/http"
	"strconv"
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
	call := mockCMS(t, "http://cms.example.com", "TOKEN")
	c := lo.Must(New("http://cms.example.com", "TOKEN"))

	item, err := c.GetItem(ctx, "a")
	assert.Equal(t, 1, call("GET /api/items/a"))
	assert.NoError(t, err)
	assert.Equal(t, &Item{
		ID:     "a",
		Fields: []Field{{ID: "f", Type: "text", Value: "t"}},
	}, item)

	item, err = c.CreateItem(ctx, "a", nil)
	assert.Equal(t, 1, call("POST /api/models/a/items"))
	assert.NoError(t, err)
	assert.Equal(t, &Item{
		ID:     "a",
		Fields: []Field{{ID: "f", Type: "text", Value: "t"}},
	}, item)

	item, err = c.CreateItemByKey(ctx, "ppp", "mmm", nil)
	assert.Equal(t, 1, call("POST /api/projects/ppp/models/mmm/items"))
	assert.NoError(t, err)
	assert.Equal(t, &Item{
		ID:     "a",
		Fields: []Field{{ID: "f", Type: "text", Value: "t"}},
	}, item)

	item, err = c.UpdateItem(ctx, "a", nil)
	assert.Equal(t, 1, call("PATCH /api/items/a"))
	assert.NoError(t, err)
	assert.Equal(t, &Item{
		ID:     "a",
		Fields: []Field{{ID: "f", Type: "text", Value: "t"}},
	}, item)

	err = c.DeleteItem(ctx, "a")
	assert.Equal(t, 1, call("DELETE /api/items/a"))
	assert.NoError(t, err)

	a, err := c.Asset(ctx, "a")
	assert.Equal(t, 1, call("GET /api/assets/a"))
	assert.NoError(t, err)
	assert.Equal(t, &Asset{ID: "a", URL: "url"}, a)

	assetID, err := c.UploadAsset(ctx, "ppp", "aaa")
	assert.Equal(t, 1, call("POST /api/projects/ppp/assets"))
	assert.NoError(t, err)
	assert.Equal(t, "idid", assetID)

	assetID, err = c.UploadAssetDirectly(ctx, "ppp", "file.txt", strings.NewReader("datadata"))
	assert.Equal(t, 2, call("POST /api/projects/ppp/assets"))
	assert.NoError(t, err)
	assert.Equal(t, "idid", assetID)

	assert.NoError(t, c.CommentToAsset(ctx, "c", "comment"))
	assert.Equal(t, 1, call("POST /api/assets/c/comments"))

	// invalid token
	httpmock.Reset()
	call = mockCMS(t, "http://cms.example.com", "TOKEN")
	c = lo.Must(New("http://cms.example.com", "TOKEN2"))

	item, err = c.GetItem(ctx, "a")
	assert.Equal(t, 1, call("GET /api/items/a"))
	assert.Nil(t, item)
	assert.ErrorContains(t, err, "failed to request: code=401")

	items, err := c.GetItemsPartially(ctx, "mmm", 1, 1)
	assert.Equal(t, 1, call("GET /api/models/mmm/items"))
	assert.Nil(t, items)
	assert.ErrorContains(t, err, "failed to request: code=401")

	items, err = c.GetItemsPartiallyByKey(ctx, "ppp", "mmm", 1, 1)
	assert.Equal(t, 1, call("GET /api/projects/ppp/models/mmm/items"))
	assert.Nil(t, items)
	assert.ErrorContains(t, err, "failed to request: code=401")

	items, err = c.GetItems(ctx, "mmm")
	assert.Equal(t, 2, call("GET /api/models/mmm/items"))
	assert.Nil(t, items)
	assert.ErrorContains(t, err, "failed to request: code=401")

	items, err = c.GetItemsByKey(ctx, "ppp", "mmm")
	assert.Equal(t, 2, call("GET /api/projects/ppp/models/mmm/items"))
	assert.Nil(t, items)
	assert.ErrorContains(t, err, "failed to request: code=401")

	item, err = c.CreateItemByKey(ctx, "ppp", "mmm", nil)
	assert.Equal(t, 1, call("POST /api/projects/ppp/models/mmm/items"))
	assert.Nil(t, item)
	assert.ErrorContains(t, err, "failed to request: code=401")

	item, err = c.CreateItem(ctx, "a", nil)
	assert.Equal(t, 1, call("POST /api/models/a/items"))
	assert.Nil(t, item)
	assert.ErrorContains(t, err, "failed to request: code=401")

	item, err = c.UpdateItem(ctx, "a", nil)
	assert.Equal(t, 1, call("PATCH /api/items/a"))
	assert.Nil(t, item)
	assert.ErrorContains(t, err, "failed to request: code=401")

	err = c.DeleteItem(ctx, "a")
	assert.Equal(t, 1, call("DELETE /api/items/a"))
	assert.Nil(t, item)
	assert.ErrorContains(t, err, "failed to request: code=401")

	assetID, err = c.UploadAsset(ctx, "ppp", "aaa")
	assert.Equal(t, 1, call("POST /api/projects/ppp/assets"))
	assert.ErrorContains(t, err, "failed to request: code=401")
	assert.Equal(t, "", assetID)

	assetID, err = c.UploadAssetDirectly(ctx, "ppp", "file.txt", strings.NewReader("datadata"))
	assert.Equal(t, 2, call("POST /api/projects/ppp/assets"))
	assert.ErrorContains(t, err, "failed to request: code=401")
	assert.Equal(t, "", assetID)

	assert.ErrorContains(t, c.CommentToAsset(ctx, "c", "comment"), "failed to request: code=401")
	assert.Equal(t, 1, call("POST /api/assets/c/comments"))

	_, err = c.Asset(ctx, "a")
	assert.Equal(t, 1, call("GET /api/assets/a"))
	assert.ErrorContains(t, err, "failed to request: code=401")
}

func TestCMS_GetItems(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	ctx := context.Background()
	call := mockCMS(t, "http://cms.example.com", "TOKEN")
	c := lo.Must(New("http://cms.example.com", "TOKEN"))

	items, err := c.GetItemsPartially(ctx, "mmm", 1, 1)
	assert.Equal(t, 1, call("GET /api/models/mmm/items"))
	assert.NoError(t, err)
	assert.Equal(t, &Items{
		Items:      testItems[0:1],
		Page:       1,
		PerPage:    1,
		TotalCount: len(testItems),
	}, items)

	items, err = c.GetItemsPartiallyByKey(ctx, "ppp", "mmm", 1, 1)
	assert.Equal(t, 1, call("GET /api/projects/ppp/models/mmm/items"))
	assert.NoError(t, err)
	assert.Equal(t, &Items{
		Items:      testItems[0:1],
		Page:       1,
		PerPage:    1,
		TotalCount: len(testItems),
	}, items)

	items, err = c.GetItems(ctx, "mmm")
	assert.Equal(t, 6, call("GET /api/models/mmm/items"))
	assert.NoError(t, err)
	assert.Equal(t, &Items{
		Items:      testItems,
		Page:       1,
		PerPage:    100,
		TotalCount: len(testItems),
	}, items)

	items, err = c.GetItemsByKey(ctx, "ppp", "mmm")
	assert.Equal(t, 6, call("GET /api/projects/ppp/models/mmm/items"))
	assert.NoError(t, err)
	assert.Equal(t, &Items{
		Items:      testItems,
		Page:       1,
		PerPage:    100,
		TotalCount: len(testItems),
	}, items)
}

func mockCMS(t *testing.T, host, token string) func(string) int {
	t.Helper()

	checkHeader := func(next func(req *http.Request) (any, error)) func(req *http.Request) (*http.Response, error) {
		return func(req *http.Request) (*http.Response, error) {
			if t := parseToken(req); t != token {
				return httpmock.NewJsonResponse(http.StatusUnauthorized, "unauthorized")
			}

			if req.Method != "GET" {
				if c := req.Header.Get("Content-Type"); c != "application/json" && !strings.HasPrefix(c, "multipart/form-data") {
					return httpmock.NewJsonResponse(http.StatusUnsupportedMediaType, "unsupported media type")
				}
			}

			res, err := next(req)
			if err != nil {
				return nil, err
			}
			return httpmock.NewJsonResponse(http.StatusOK, res)
		}
	}

	httpmock.RegisterResponder("GET", host+"/api/items/a", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{
			"id":     "a",
			"fields": []map[string]string{{"id": "f", "type": "text", "value": "t"}},
		}, nil
	}))

	itemsResponder := checkHeader(func(r *http.Request) (any, error) {
		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		perPage, _ := strconv.Atoi(r.URL.Query().Get("perPage"))
		if page < 1 {
			page = 1
		}
		if perPage < 1 {
			perPage = 50
		}
		max := page * perPage
		if max > len(testItems) {
			max = len(testItems)
		}

		return map[string]any{
			"items":      testItems[(page-1)*perPage : max],
			"page":       page,
			"perPage":    perPage,
			"totalCount": len(testItems),
		}, nil
	})

	httpmock.RegisterResponder("GET", host+"/api/projects/ppp/models/mmm/items", itemsResponder)
	httpmock.RegisterResponder("GET", host+"/api/models/mmm/items", itemsResponder)

	httpmock.RegisterResponder("POST", host+"/api/projects/ppp/models/mmm/items", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{
			"id":     "a",
			"fields": []map[string]string{{"id": "f", "type": "text", "value": "t"}},
		}, nil
	}))

	httpmock.RegisterResponder("PATCH", host+"/api/items/a", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{
			"id":     "a",
			"fields": []map[string]string{{"id": "f", "type": "text", "value": "t"}},
		}, nil
	}))

	httpmock.RegisterResponder("POST", host+"/api/models/a/items", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{
			"id":     "a",
			"fields": []map[string]string{{"id": "f", "type": "text", "value": "t"}},
		}, nil
	}))

	httpmock.RegisterResponder("DELETE", host+"/api/items/a", checkHeader(func(r *http.Request) (any, error) {
		return nil, nil
	}))

	httpmock.RegisterResponder("POST", host+"/api/projects/ppp/assets", checkHeader(func(r *http.Request) (any, error) {
		if c := r.Header.Get("Content-Type"); strings.HasPrefix(c, "multipart/form-data") {
			f, fh, err := r.FormFile("file")
			if err != nil {
				return nil, err
			}
			defer func() {
				_ = f.Close()
			}()
			d, _ := io.ReadAll(f)
			assert.Equal(t, "datadata", string(d))
			assert.Equal(t, "file.txt", fh.Filename)
		}

		return map[string]any{
			"id": "idid",
		}, nil
	}))

	httpmock.RegisterResponder("POST", host+"/api/items/itit/comments", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{}, nil
	}))

	httpmock.RegisterResponder("POST", host+"/api/assets/c/comments", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{}, nil
	}))

	httpmock.RegisterResponder("GET", host+"/api/assets/a", checkHeader(func(r *http.Request) (any, error) {
		return map[string]any{
			"id":  "a",
			"url": "url",
		}, nil
	}))

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

var testItems = lo.Map(lo.Range(500), func(i, _ int) Item {
	return Item{
		ID:     strconv.Itoa(i),
		Fields: []Field{{ID: "f", Type: "text", Value: "t"}},
	}
})

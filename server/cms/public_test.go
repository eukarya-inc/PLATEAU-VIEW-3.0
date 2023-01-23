package cms

import (
	"context"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPublicAPIClient_GetItems(t *testing.T) {
	ctx := context.Background()
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("GET", "https://example.com/api/p/ppp/mmm", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results": []any{
			map[string]any{"id": "a"},
			map[string]any{"id": "b"},
		},
	})))
	httpmock.RegisterResponder("GET", "https://example.com/api/p/ppp/mmm2", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, nil)))

	c := NewPublicAPIClient[any](nil, "https://example.com/", "ppp")
	res, err := c.GetItems(ctx, "mmm")
	assert.NoError(t, err)
	assert.Equal(t, []any{
		map[string]any{"id": "a"},
		map[string]any{"id": "b"},
	}, res)

	res, err = c.GetItems(ctx, "mmm2")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Nil(t, res)
}

func TestPublicAPIClient_GetItem(t *testing.T) {
	ctx := context.Background()
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("GET", "https://example.com/api/p/ppp/mmm/iii", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"id": "a",
	})))
	httpmock.RegisterResponder("GET", "https://example.com/api/p/ppp/mmm/iii2", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, nil)))

	c := NewPublicAPIClient[any](nil, "https://example.com/", "ppp")
	res, err := c.GetItem(ctx, "mmm", "iii")
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{"id": "a"}, res)

	res, err = c.GetItem(ctx, "mmm", "iii2")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Nil(t, res)
}

func TestPublicAPIClient_GetAsset(t *testing.T) {
	ctx := context.Background()
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("GET", "https://example.com/api/p/ppp/assets/aaa", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"id":    "aaa",
		"url":   "https://example.com",
		"files": []string{"https://example.com/a.txt", "https://example.com/b.txt"},
	})))
	httpmock.RegisterResponder("GET", "https://example.com/api/p/ppp/assets/aaa2", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, nil)))

	c := NewPublicAPIClient[any](nil, "https://example.com/", "ppp")
	res, err := c.GetAsset(ctx, "aaa")
	assert.NoError(t, err)
	assert.Equal(t, &PublicAsset{
		ID:  "aaa",
		URL: "https://example.com",
		Files: []string{
			"https://example.com/a.txt",
			"https://example.com/b.txt",
		},
	}, res)

	res, err = c.GetAsset(ctx, "aaa2")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Nil(t, res)
}

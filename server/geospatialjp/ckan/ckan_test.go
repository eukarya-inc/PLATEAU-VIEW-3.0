package ckan

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/stretchr/testify/assert"
)

func TestCkan(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCkan(t)

	ctx := context.Background()
	ckan, err := New("https://www.geospatial.jp/ckan", "TOKEN")
	assert.NoError(t, err)

	p, err := ckan.ShowPackage(ctx, "plateau-tokyo23ku")
	assert.NoError(t, err)
	assert.Equal(t, Package{
		ID:       "xxx",
		Name:     "plateau-tokyo23ku",
		OwnerOrg: "yyy",
		Resources: []Resource{
			{ID: "a", URL: "https://example.com", PackageID: "xxx"},
		},
	}, p)

	p, err = ckan.CreatePackage(ctx, Package{
		Name:     "plateau-tokyo23ku",
		OwnerOrg: "yyy",
	})
	assert.NoError(t, err)
	assert.Equal(t, Package{
		ID:       "xxx",
		Name:     "plateau-tokyo23ku",
		OwnerOrg: "yyy",
	}, p)

	p, err = ckan.UpdatePackage(ctx, Package{
		ID:       "xxx",
		Name:     "plateau-tokyo23ku!",
		OwnerOrg: "yyy",
	})
	assert.NoError(t, err)
	assert.Equal(t, Package{
		ID:       "xxx",
		Name:     "plateau-tokyo23ku!",
		OwnerOrg: "yyy",
	}, p)

	r, err := ckan.CreateResource(ctx, Resource{
		Name: "aaa",
		URL:  "https://example.com",
	})
	assert.NoError(t, err)
	assert.Equal(t, Resource{
		ID:   "a",
		Name: "aaa",
		URL:  "https://example.com",
	}, r)

	r, err = ckan.UpdateResource(ctx, Resource{
		ID:   "a",
		Name: "aaa!",
		URL:  "https://example.com",
	})
	assert.NoError(t, err)
	assert.Equal(t, Resource{
		ID:   "a",
		Name: "aaa!",
		URL:  "https://example.com",
	}, r)

	ckan.token = "xxx"
	r, err = ckan.UpdateResource(ctx, Resource{
		ID:   "a",
		Name: "aaa!",
		URL:  "https://example.com",
	})
	assert.ErrorContains(t, err, "failed to update a resource: status code 401: ")
	assert.Empty(t, r)
}

func mockCkan(t *testing.T) {
	t.Helper()

	checkAuth := func(req *http.Request) (*http.Response, error) {
		if req.Header.Get("X-CKAN-API-Key") != "TOKEN" {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, Response[any]{Error: &Error{Message: "error"}})
		}
		return nil, nil
	}

	httpmock.RegisterResponderWithQuery("GET", "https://www.geospatial.jp/ckan/api/3/action/package_show", "id=plateau-tokyo23ku", func(req *http.Request) (*http.Response, error) {
		if res, err := checkAuth(req); res != nil {
			return res, err
		}

		return httpmock.NewJsonResponse(http.StatusOK, Response[Package]{
			Success: true,
			Result: Package{
				ID:       "xxx",
				Name:     "plateau-tokyo23ku",
				OwnerOrg: "yyy",
				Resources: []Resource{
					{ID: "a", URL: "https://example.com", PackageID: "xxx"},
				},
			},
		})
	})

	httpmock.RegisterResponder("POST", "https://www.geospatial.jp/ckan/api/3/action/package_create", func(req *http.Request) (*http.Response, error) {
		if res, err := checkAuth(req); res != nil {
			return res, err
		}

		res := Package{}
		_ = json.NewDecoder(req.Body).Decode(&res)
		res.ID = "xxx"

		return httpmock.NewJsonResponse(http.StatusOK, Response[Package]{
			Result: res,
		})
	})

	httpmock.RegisterResponder("POST", "https://www.geospatial.jp/ckan/api/3/action/package_update", func(req *http.Request) (*http.Response, error) {
		if res, err := checkAuth(req); res != nil {
			return res, err
		}

		res := Package{}
		_ = json.NewDecoder(req.Body).Decode(&res)
		if res.ID == "" {
			return httpmock.NewJsonResponse(http.StatusBadRequest, Response[any]{Error: &Error{Message: "id missing"}})
		}

		return httpmock.NewJsonResponse(http.StatusOK, Response[Package]{
			Result: res,
		})
	})

	httpmock.RegisterResponder("POST", "https://www.geospatial.jp/ckan/api/3/action/resource_create", func(req *http.Request) (*http.Response, error) {
		if res, err := checkAuth(req); res != nil {
			return res, err
		}

		res := Resource{}
		_ = json.NewDecoder(req.Body).Decode(&res)
		res.ID = "a"

		return httpmock.NewJsonResponse(http.StatusOK, Response[Resource]{
			Result: res,
		})
	})

	httpmock.RegisterResponder("POST", "https://www.geospatial.jp/ckan/api/3/action/resource_update", func(req *http.Request) (*http.Response, error) {
		if res, err := checkAuth(req); res != nil {
			return res, err
		}

		res := Resource{}
		_ = json.NewDecoder(req.Body).Decode(&res)
		if res.ID == "" {
			return httpmock.NewJsonResponse(http.StatusBadRequest, Response[any]{Error: &Error{Message: "id missing"}})
		}

		return httpmock.NewJsonResponse(http.StatusOK, Response[Resource]{
			Result: res,
		})
	})
}

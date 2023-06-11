package sidebar

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path"
	"strings"
	"testing"
	"time"

	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

const (
	testCMSHost    = "https://example.com"
	testCMSToken   = "token"
	testCMSProject = "prj"
)

func TestHandler(t *testing.T) {
	const base = ""
	const token = ""
	const project = ""

	if base == "" || token == "" || project == "" {
		t.SkipNow()
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(project)

	h := &Handler{
		cmsMain: lo.Must(cms.New(base, token)),
	}
	handler := h.getAllDataHandler()
	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)

	_ = os.WriteFile("result.json", rec.Body.Bytes(), 0644)
}

func TestHandler_getDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMSToken()

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		if req.Header.Get("Authorization") != "Bearer "+testCMSToken {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, nil)
		}

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []cms.Field{
				{Key: dataField, Value: expected},
			},
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	p := path.Join("/", testCMSProject, "data", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)
	handler := newHandler().getDataHandler()

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())

	// invalid
	p = path.Join("/", "INVALID", "data", itemID)
	req = httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	ctx = echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("INVALID", itemID)
	handler = newHandler().getDataHandler()
	assert.Equal(t, rerror.ErrNotFound, handler(ctx))
}

func TestHandler_getDataHandler2(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMSToken()

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		if req.Header.Get("Authorization") != "Bearer token!" {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, nil)
		}

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []cms.Field{
				{Key: dataField, Value: expected},
			},
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	p := path.Join("/", "prjprj", "data", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("prjprj", itemID)
	handler := newHandler().getDataHandler()

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())

	// not found
	p = path.Join("/", "INVALID", "data", itemID)
	req = httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	ctx = echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("INVALID", itemID)
	handler = newHandler().getDataHandler()
	assert.Equal(t, rerror.ErrNotFound, handler(ctx))
}

func TestHandler_getAllDataHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `[{"hoge":"foo"},{"hoge":"bar"}]` + "\n"
	lastModified := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.Local)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey)),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Model{LastModified: lastModified}),
	)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey, "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Items{
			Items: []cms.Item{
				{
					ID:     "a",
					Fields: []cms.Field{{Key: dataField, Value: `{"hoge":"foo"}`}},
				},
				{
					ID:     "b",
					Fields: []cms.Field{{Key: dataField, Value: `{"hoge":"bar"}`}},
				},
			},
			Page:       1,
			PerPage:    50,
			TotalCount: 1,
		}),
	)

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "data"), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	handler := newHandler().getAllDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
	assert.Equal(t, lastModified.Format(time.RFC1123), rec.Header().Get("Last-Modified"))
}

func TestHandler_createDataHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `{"hoge":"foo"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: "a",
			Fields: []cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).ValueString()},
			},
		},
		)
	}
	httpmock.RegisterResponder("POST", lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey, "items")), responder)

	req := httptest.NewRequest(http.MethodPost, path.Join("/", testCMSProject, "data"), strings.NewReader(`{"hoge":"foo"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)
	handler := newHandler().createDataHandler()
	err := handler(ctx)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_updateDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).ValueString()},
			},
		},
		)
	}
	httpmock.RegisterResponder("PATCH", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	p := path.Join("/", testCMSProject, "data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	handler := newHandler().updateDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_deleteDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("DELETE", lo.Must(url.JoinPath(testCMSHost, "/api/items/", itemID)), httpmock.NewBytesResponder(http.StatusNoContent, nil))

	p := path.Join("/", testCMSProject, "data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	handler := newHandler().deleteDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusNoContent, rec.Result().StatusCode)
}

func TestHandler_fetchTemplatesHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `[{"hoge":"hoge"},{"hoge":"foo"}]` + "\n"
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey, "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Items{
			Items: []cms.Item{
				{
					ID:     "a",
					Fields: []cms.Field{{Key: dataField, Value: `{"hoge":"hoge"}`}},
				},
				{
					ID:     "b",
					Fields: []cms.Field{{Key: dataField, Value: `{"hoge":"foo"}`}},
				},
			},
			Page:       1,
			PerPage:    50,
			TotalCount: 2,
		}),
	)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey)),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Model{}),
	)

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates"), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	handler := newHandler().fetchTemplatesHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_fetchTemplateHandler(t *testing.T) {
	templateID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID:     templateID,
			Fields: []cms.Field{{Key: dataField, Value: `{"hoge":"hoge"}`}},
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", templateID)), responder)

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates", templateID), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "tid")
	ctx.SetParamValues(testCMSProject, templateID)

	handler := newHandler().fetchTemplateHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_createTemplateHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: "a",
			Fields: []cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).ValueString()},
			},
		},
		)
	}
	httpmock.RegisterResponder("POST", lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey, "items")), responder)

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates"), strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	handler := newHandler().createTemplateHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_updateTemplateHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()

	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).ValueString()},
			},
		},
		)
	}
	httpmock.RegisterResponder("PATCH", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	p := path.Join("/", testCMSProject, "templates/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	handler := newHandler().updateDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, `{"hoge":"hoge"}`+"\n", rec.Body.String())
}

func TestHandler_deleteTemplateHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("DELETE", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), httpmock.NewBytesResponder(http.StatusNoContent, nil))

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates", itemID), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	handler := newHandler().deleteDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusNoContent, rec.Result().StatusCode)
}

func TestHandler_LastModified(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	lastModified := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.Local)
	lastModified2 := time.Date(2022, time.April, 2, 0, 0, 0, 0, time.Local)

	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey)),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Model{LastModified: lastModified}),
	)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey)),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Model{LastModified: lastModified2}),
	)

	e := echo.New()

	// no If-Modified-Since
	r := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	hit, err := newHandler().lastModified(e.NewContext(r, w), testCMSProject, dataModelKey, templateModelKey)
	assert.NoError(t, err)
	assert.False(t, hit)
	assert.Equal(t, lastModified2.Format(time.RFC1123), w.Header().Get(echo.HeaderLastModified))

	// If-Modified-Since
	r = httptest.NewRequest("GET", "/", nil)
	r.Header.Set(echo.HeaderIfModifiedSince, lastModified2.Format(time.RFC1123))
	w = httptest.NewRecorder()
	hit, err = newHandler().lastModified(e.NewContext(r, w), testCMSProject, dataModelKey, templateModelKey)
	assert.NoError(t, err)
	assert.True(t, hit)
	assert.Equal(t, http.StatusNotModified, w.Result().StatusCode)
	assert.Equal(t, lastModified2.Format(time.RFC1123), w.Header().Get(echo.HeaderLastModified))

	// expired If-Modified-Since
	r = httptest.NewRequest("GET", "/", nil)
	r.Header.Set(echo.HeaderIfModifiedSince, lastModified.Format(time.RFC1123))
	w = httptest.NewRecorder()
	hit, err = newHandler().lastModified(e.NewContext(r, w), testCMSProject, dataModelKey, templateModelKey)
	assert.NoError(t, err)
	assert.False(t, hit)
	assert.Equal(t, lastModified2.Format(time.RFC1123), w.Header().Get(echo.HeaderLastModified))
}

func TestHandler_getToken(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMSToken()
	h := newHandler()

	toekn, err := h.getToken(context.Background(), "prjprj")
	assert.NoError(t, err)
	assert.Equal(t, "token!", toekn)

	toekn, err = h.getToken(context.Background(), "prjprj!")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Empty(t, toekn)
}

func newHandler() *Handler {
	return &Handler{
		cmsbase:         testCMSHost,
		cmsMainProject:  testCMSProject,
		cmsTokenProject: tokenProject,
		cmsMain:         lo.Must(cms.New(testCMSHost, testCMSToken)),
	}
}

func mockCMSToken() {
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", tokenProject, "models", tokenModel, "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, cms.Items{
			PerPage:    1,
			Page:       1,
			TotalCount: 1,
			Items: []cms.Item{
				{
					ID: "id",
					Fields: []cms.Field{
						{Key: tokenProjectField, Value: "prjprj"},
						{Key: tokenTokenField, Value: "token!"},
					},
				},
			},
		}),
	)
}

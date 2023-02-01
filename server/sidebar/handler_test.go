package sidebar

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path"
	"strings"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

const (
	testCMSHost    = "https://api.cms.test.reearth.dev"
	testCMSToken   = "token"
	testCMSProject = "prj"
)

func newHandler() *Handler {
	CMS := lo.Must(cms.New(testCMSHost, testCMSToken))
	return &Handler{
		CMS:        CMS,
		CMSProject: testCMSProject,
	}
}

func TestHandler_getDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []cms.Field{
				{Key: dataField, Value: expected},
			},
		},
		)
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	p := path.Join("/aaa/data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("aaa", itemID)

	handler := newHandler().getDataHandler()
	res := handler(ctx)

	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_getAllDataHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `[{"hoge":"foo"},{"hoge":"bar"}]` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		return httpmock.NewJsonResponse(http.StatusOK, &cms.Items{
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
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey, "items")), responder)

	req := httptest.NewRequest(http.MethodGet, "/aaa/data", nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues("aaa")

	handler := newHandler().getAllDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
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

	req := httptest.NewRequest(http.MethodPost, "/aaa/data", strings.NewReader(`{"hoge":"foo"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues("aaa")
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

	p := path.Join("/aaa/data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("aaa", itemID)

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

	p := path.Join("/aaa/data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("aaa", itemID)

	handler := newHandler().deleteDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusNoContent, rec.Result().StatusCode)
}

func TestHandler_fetchTemplatesHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	expected := `[{"hoge":"hoge"},{"hoge":"foo"}]` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		return httpmock.NewJsonResponse(http.StatusOK, &cms.Items{
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
		},
		)
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey, "items")), responder)

	req := httptest.NewRequest(http.MethodGet, "/aaa/templates", nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues("aaa")

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

	req := httptest.NewRequest(http.MethodGet, path.Join("/aaa/templates", templateID), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("tid")
	ctx.SetParamValues(templateID)

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

	req := httptest.NewRequest(http.MethodGet, "/aaa/templates", strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues("aaa")

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

	p := path.Join("/aaa/templates/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("aaa", itemID)

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

	req := httptest.NewRequest(http.MethodGet, path.Join("/aaa/templates", itemID), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("aaa", itemID)

	handler := newHandler().deleteDataHandler()
	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusNoContent, rec.Result().StatusCode)
}

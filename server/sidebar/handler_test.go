package sidebar

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestHandler_getMetadata(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)
	h := newHandler()

	toekn, err := h.getMetadata(context.Background(), "prjprj")
	assert.NoError(t, err)
	assert.Equal(t, Metadata{
		ProjectAlias:       "prjprj",
		CMSAPIKey:          "token!",
		SidebarAccessToken: "ac",
	}, toekn)

	toekn, err = h.getMetadata(context.Background(), "prjprj!")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Empty(t, toekn)
}

func TestHandler_lastModified(t *testing.T) {
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
	h := newHandler()
	cms := lo.Must(cms.New(testCMSHost, testCMSToken))

	e := echo.New()

	// no If-Modified-Since
	r := httptest.NewRequest("GET", "/", nil)
	r = r.WithContext(context.WithValue(r.Context(), cmsContextKey{}, cms))
	w := httptest.NewRecorder()
	hit, err := h.lastModified(e.NewContext(r, w), testCMSProject, dataModelKey, templateModelKey)
	assert.NoError(t, err)
	assert.False(t, hit)
	assert.Equal(t, lastModified2.Format(time.RFC1123), w.Header().Get(echo.HeaderLastModified))

	// If-Modified-Since
	r = httptest.NewRequest("GET", "/", nil)
	r = r.WithContext(context.WithValue(r.Context(), cmsContextKey{}, cms))
	r.Header.Set(echo.HeaderIfModifiedSince, lastModified2.Format(time.RFC1123))
	w = httptest.NewRecorder()
	hit, err = newHandler().lastModified(e.NewContext(r, w), testCMSProject, dataModelKey, templateModelKey)
	assert.NoError(t, err)
	assert.True(t, hit)
	assert.Equal(t, http.StatusNotModified, w.Result().StatusCode)
	assert.Equal(t, lastModified2.Format(time.RFC1123), w.Header().Get(echo.HeaderLastModified))

	// expired If-Modified-Since
	r = httptest.NewRequest("GET", "/", nil)
	r = r.WithContext(context.WithValue(r.Context(), cmsContextKey{}, cms))
	r.Header.Set(echo.HeaderIfModifiedSince, lastModified.Format(time.RFC1123))
	w = httptest.NewRecorder()
	hit, err = newHandler().lastModified(e.NewContext(r, w), testCMSProject, dataModelKey, templateModelKey)
	assert.NoError(t, err)
	assert.False(t, hit)
	assert.Equal(t, lastModified2.Format(time.RFC1123), w.Header().Get(echo.HeaderLastModified))
}

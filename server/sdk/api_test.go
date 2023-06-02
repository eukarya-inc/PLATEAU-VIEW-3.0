package sdk

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/fme"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestRequestHandler(t *testing.T) {
	s := &Services{
		CMS:       &cmsMock{},
		FME:       &fmeMock{},
		FMESecret: "secret",
	}
	e := echo.New()
	g := e.Group("")

	err := requestHandler(Config{APIToken: "token!"}, g, s)
	assert.NoError(t, err)

	req := httptest.NewRequest("POST", "/request_max_lod", strings.NewReader(`{"ids":["id1","id2"],"project":"prj"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer token!")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "\"ok\"\n", rec.Body.String())

	assert.Equal(t, []string{"id1", "id2"}, s.CMS.(*cmsMock).GetItemCalls)
	assert.Equal(t, []string{"citygml", "citygml"}, s.CMS.(*cmsMock).AssetCalls)

	assert.Equal(t, []struct {
		ID     string
		Fields []cms.Field
	}{
		{
			ID: "id1",
			Fields: []cms.Field{
				{
					Key:   "max_lod_status",
					Type:  "select",
					Value: string(StatusProcessing),
				},
			},
		},
		{
			ID: "id2",
			Fields: []cms.Field{
				{
					Key:   "max_lod_status",
					Type:  "select",
					Value: string(StatusProcessing),
				},
			},
		},
	}, s.CMS.(*cmsMock).UpdateItemCalls)

	assert.Equal(t, []fme.Request{
		fme.MaxLODRequest{
			ID: fme.ID{
				ItemID:    "id1",
				AssetID:   "citygml",
				ProjectID: "prj",
			}.String("secret"),
			Target: "https://example.com/citygml.zip",
		},
		fme.MaxLODRequest{
			ID: fme.ID{
				ItemID:    "id2",
				AssetID:   "citygml",
				ProjectID: "prj",
			}.String("secret"),
			Target: "https://example.com/citygml.zip",
		},
	}, s.FME.(*fmeMock).RequestCalls)
}

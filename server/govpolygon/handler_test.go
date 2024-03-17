package govpolygon

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	url := ""
	if url == "" {
		t.Skip("skipping test; no URL provided")
	}
	h := New(url, true)

	e := echo.New()
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	c := e.NewContext(r, w)

	assert.NoError(t, h.GetGeoJSON(c))

	assert.Equal(t, http.StatusOK, w.Code)
	body := w.Body.String()
	assert.NotEmpty(t, body)

	t.Log(body)
}

func TestProcessor(t *testing.T) {
	p := &Processor{
		dirpath:           dirpath,
		key1:              key1,
		key2:              key2,
		simplifyTolerance: 0,
	}
	write := false

	ctx := context.Background()
	geojson, notfound, err := p.ComputeGeoJSON(ctx, nil, nil)
	assert.NoError(t, err)
	assert.Nil(t, notfound)
	assert.NotEmpty(t, geojson)

	if write {
		j, _ := json.MarshalIndent(geojson, "", "  ")
		_ = os.WriteFile("test.geojson", j, 0644)
	}
}

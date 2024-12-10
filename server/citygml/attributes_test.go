package citygml

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testdata = "52382287_bldg_6697_psc_op.gml"

var ids = []string{"bldg_53e2a9a9-d512-408f-8250-eae30b7523d6"}
var expected = []map[string]any{
	{
		"bldg:measuredHeight":     14.3,
		"bldg:measuredHeight_uom": "m",
		"feature_type":            "bldg:Building",
		"gen:genericAttribute": []any{
			map[string]any{
				"name":  "風致地区",
				"type":  "string",
				"value": "第1種風致地区（大崩）",
			},
		},
		"gml:id":                           "bldg_53e2a9a9-d512-408f-8250-eae30b7523d6",
		"uro:buildingDataQualityAttribute": []any{map[string]any{}},
	},
}

func TestAttributes(t *testing.T) {
	citygml, err := os.Open("testdata/" + testdata)
	require.NoError(t, err)
	defer citygml.Close()

	attrs, err := Attributes(citygml, ids)
	assert.NoError(t, err)
	assert.Equal(t, 1, len(attrs))
	assert.Equal(t, ids[0], attrs[0]["gml:id"])
	assert.Equal(t, expected, attrs)
}

func TestAttributesHandler(t *testing.T) {
	citygmlURL := "http://example.com/citygml.gml"
	citygml, err := os.ReadFile("testdata/" + testdata)
	require.NoError(t, err)

	httpmock.RegisterResponder(http.MethodGet, citygmlURL, httpmock.NewBytesResponder(http.StatusOK, citygml))
	httpmock.Activate()
	defer httpmock.Deactivate()

	u := &url.URL{Path: "/attributes"}
	q := url.Values{}
	q.Set("url", citygmlURL)
	q.Set("id", strings.Join(ids, ","))
	u.RawQuery = q.Encode()

	req := httptest.NewRequest(http.MethodGet, u.String(), nil)
	rec := httptest.NewRecorder()
	e := echo.New()
	c := e.NewContext(req, rec)
	assert.NoError(t, attributeHandler("")(c))

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json; charset=UTF-8", rec.Header().Get(echo.HeaderContentType))

	var j []map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &j))
	assert.Equal(t, expected, j)
}

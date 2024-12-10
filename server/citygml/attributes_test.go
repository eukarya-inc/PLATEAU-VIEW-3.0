package citygml

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAttributes(t *testing.T) {
	const testdata = "52382287_bldg_6697_psc_op.gml"
	ids := []string{"bldg_53e2a9a9-d512-408f-8250-eae30b7523d6"}
	expected := []map[string]any{
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
			"gml:id":                           []string{"bldg_53e2a9a9-d512-408f-8250-eae30b7523d6"},
			"uro:buildingDataQualityAttribute": []any{map[string]any{}},
		},
	}

	citygml, err := os.ReadFile("testdata/" + testdata)
	require.NoError(t, err)

	const citygmlURL = "http://example.com/test.gml"
	httpmock.RegisterResponder("GET", citygmlURL, httpmock.NewBytesResponder(http.StatusOK, citygml))

	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	attrs, err := Attributes(http.DefaultClient, citygmlURL, ids)

	assert.NoError(t, err)
	assert.Equal(t, 1, len(attrs))
	assert.Equal(t, []string{ids[0]}, attrs[0]["gml:id"])
	assert.Equal(t, expected, attrs)
}

func TestAttributesAPI(t *testing.T) {
	const citygmlURL = ""
	const id = ""

	if citygmlURL == "" || id == "" {
		t.Skip("skipping test; citygmlURL or ids not set")
	}

	e := echo.New()
	require.NoError(t, Echo(PackerConfig{}, e.Group("")))

	u := &url.URL{Path: "/attributes"}
	q := url.Values{}
	q.Set("url", citygmlURL)
	q.Set("id", id)
	u.RawQuery = q.Encode()

	t.Logf("GET %s", u.String())
	req := httptest.NewRequest(http.MethodGet, u.String(), nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json; charset=UTF-8", rec.Header().Get(echo.HeaderContentType))
	body := rec.Body.String()
	assert.NotEmpty(t, body)
	t.Logf("%s", body)
}

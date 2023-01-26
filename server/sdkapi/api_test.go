package sdkapi

import (
	"context"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/stretchr/testify/assert"
)

func TestGetMaxLOD(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	data := `code,type,maxLod
53394452,bldg,1
53394452,tran,1
53394453,bldg,1
53394453,tran,1
53394461,bldg,1
53394461,tran,1
53394462,bldg,1`
	httpmock.RegisterResponder("GET", "https://example.com", httpmock.NewBytesResponder(http.StatusOK, []byte(data)))

	ctx := context.Background()
	res, err := getMaxLOD(ctx, "https://example.com")
	assert.NoError(t, err)
	assert.Equal(t, MaxLODColumns{
		{Code: "53394452", Type: "bldg", MaxLOD: 1},
		{Code: "53394452", Type: "tran", MaxLOD: 1},
		{Code: "53394453", Type: "bldg", MaxLOD: 1},
		{Code: "53394453", Type: "tran", MaxLOD: 1},
		{Code: "53394461", Type: "bldg", MaxLOD: 1},
		{Code: "53394461", Type: "tran", MaxLOD: 1},
		{Code: "53394462", Type: "bldg", MaxLOD: 1},
	}, res)
}

package cmsintegrationflow

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/stretchr/testify/assert"
)

func TestReadDic(t *testing.T) {
	ctx := context.Background()
	u := "https://example.com"
	want := "test"

	t.Run("ok", func(t *testing.T) {
		httpmock.Activate()
		defer httpmock.DeactivateAndReset()

		httpmock.RegisterResponder(http.MethodGet, u, httpmock.NewStringResponder(http.StatusOK, want))

		got, err := readDic(ctx, u)
		assert.NoError(t, err)
		assert.Equal(t, want, got)
	})

	t.Run("error", func(t *testing.T) {
		wantErr := fmt.Errorf("status code is %d", http.StatusNotFound)

		httpmock.Activate()
		defer httpmock.DeactivateAndReset()

		httpmock.RegisterResponder(http.MethodGet, u, httpmock.NewStringResponder(http.StatusNotFound, want))

		got, err := readDic(ctx, u)
		assert.EqualError(t, err, wantErr.Error())
		assert.Empty(t, got)
	})
}

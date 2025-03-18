package govpolygon

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestComputeGeoJSON(t *testing.T) {
	names := [][]string{
		{"北海道"},
		{"北海道/札幌市"},
		{"東京都/千代田区"},
		{"北海道/札幌市"},
		{"大阪府/大阪市"},
	}
	write := false

	for i, n := range names {
		n := n
		t.Run(fmt.Sprintf("%v", n), func(t *testing.T) {
			geojson, notfound, err := ComputeGeoJSON(n)
			assert.NoError(t, err)
			assert.Empty(t, notfound)
			assert.NotEmpty(t, geojson)

			if write {
				j, _ := json.MarshalIndent(geojson, "", "  ")
				_ = os.WriteFile(fmt.Sprintf("%d.geojson", i), j, 0644)
			}
		})
	}
}

package tiles

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtractZ(t *testing.T) {
	assert.Equal(t, []string{"0"}, extractZ("hogeohoge_z0.zip"))
	assert.Equal(t, []string{"1"}, extractZ("hogeohoge_z1.zip"))
	assert.Equal(t, []string{"10"}, extractZ("hogeohoge_z10.zip"))
	assert.Equal(t, []string{"9", "10", "11", "12"}, extractZ("hogeohoge_z9-12.zip"))
}

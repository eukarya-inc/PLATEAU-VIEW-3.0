package tiles

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtractZ(t *testing.T) {
	assert.Equal(t, []string{"0"}, extractZ("hogeohoge_z0.zip"))
	assert.Equal(t, []string{"1"}, extractZ("hogeohoge_1.zip"))
	assert.Equal(t, []string{"1"}, extractZ("hogeohoge_z1.zip"))
	assert.Equal(t, []string{"10"}, extractZ("hogeohoge_z10.zip"))
	assert.Equal(t, []string{"9", "10", "11", "12"}, extractZ("hogeohoge_z9-12.zip"))
	assert.Equal(t, []string{"9", "10", "11", "12"}, extractZ("hogeohoge_9-12.zip"))
	assert.Equal(t, []string{"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"}, extractZ("hogeohoge.zip"))
}

package plateauv2

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDescFromAsset(t *testing.T) {
	name, desc := descFromAsset("https://example.com/aaa.zip", []string{
		"bbb.zip\n\nBBB",
		"aaa.zip\n\nAAA",
		"CCC",
	})
	assert.Equal(t, "", name)
	assert.Equal(t, "AAA", desc)

	name, desc = descFromAsset("", []string{
		"bbb.zip\n\nBBB",
		"aaa.zip\n\nAAA",
		"CCC",
	})
	assert.Equal(t, "", name)
	assert.Equal(t, "", desc)

	name, desc = descFromAsset("https://example.com/aaa.zip", []string{
		"CCC",
	})
	assert.Equal(t, "", name)
	assert.Equal(t, "", desc)

	name, desc = descFromAsset("https://example.com/aaa.zip", []string{
		"aaa.zip\n@name: CCC\n\naaaa\nbbbb",
	})
	assert.Equal(t, "CCC", name)
	assert.Equal(t, "aaaa\nbbbb", desc)

	name, desc = descFromAsset("https://example.com/aaa.zip", []string{
		"aaa.zip\n\n@name: CCC\naaaa\nbbbb",
	})
	assert.Equal(t, "CCC", name)
	assert.Equal(t, "aaaa\nbbbb", desc)

	name, desc = descFromAsset("https://example.com/aaa.zip", []string{
		"aaa.zip\n@name:CCC",
	})
	assert.Equal(t, "CCC", name)
	assert.Equal(t, "", desc)
}

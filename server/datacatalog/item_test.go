package datacatalog

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestResponseAll_Merge(t *testing.T) {
	// TODO
}

func TestResponseAll_MergeByCities(t *testing.T) {
	// TODO
}

func TestResponseAll_MergeByTypes(t *testing.T) {
	// TODO
}

func TestAssetURLFromFormat(t *testing.T) {
	assert.Equal(t, "https://example.com/1111/a/tileset.json", assetURLFromFormat("https://example.com/1111/a.zip", "3dtiles"))
	assert.Equal(t, "https://example.com/1111/a/tileset.json", assetURLFromFormat("https://example.com/1111/a.7z", "3dtiles"))
	assert.Equal(t, "https://example.com/1111/a", assetURLFromFormat("https://example.com/1111/a", "3dtiles"))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", assetURLFromFormat("https://example.com/1111/a.zip", "mvt"))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", assetURLFromFormat("https://example.com/1111/a.7z", "mvt"))
	assert.Equal(t, "https://example.com/1111/a", assetURLFromFormat("https://example.com/1111/a", "mvt"))
	assert.Equal(t, "https://example.com/1111/a.zip", assetURLFromFormat("https://example.com/1111/a.zip", "hoge"))
}

func TestAssetRootPath(t *testing.T) {
	assert.Equal(t, "/example.com/1111/a", assetRootPath("/example.com/1111/a.zip"))
}

package datacatalog

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

// func TestItemName(t *testing.T) {
// 	name, t2, t2en := itemName("建築物モデル", "xxx市", "", AssetName{
// 		Feature: "bldg",
// 	})
// 	assert.Equal(t, "建築物モデル（xxx市）", name)
// 	assert.Equal(t, "", t2)
// 	assert.Equal(t, "", t2en)

// 	name, t2, t2en = itemName("建築物モデル", "xxx市", "AAA", AssetName{
// 		Feature: "bldg",
// 	})
// 	assert.Equal(t, "AAA（xxx市）", name)
// 	assert.Equal(t, "", t2)
// 	assert.Equal(t, "", t2en)
// }

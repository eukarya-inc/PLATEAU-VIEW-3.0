package plateauapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestComputeContextRevision(t *testing.T) {
	newCtx := func(url string) *InMemoryRepoContext {
		return &InMemoryRepoContext{
			Name:  "plateau-2025",
			Years: []int{2025},
			CityGML: map[ID]*CityGMLDataset{
				"cg_13120": {ID: "cg_13120", URL: url},
			},
		}
	}

	a := computeContextRevision(newCtx("https://example.com/a.zip"))
	assert.NotEmpty(t, a)
	assert.Equal(t, a, computeContextRevision(newCtx("https://example.com/a.zip")))

	// Same IDs, different content: e.g. a rebuilt zip or new G空間情報センター files.
	assert.NotEqual(t, a, computeContextRevision(newCtx("https://example.com/b.zip")))

	withFiles := newCtx("https://example.com/a.zip")
	withFiles.CityGML["cg_13120"].GspatialjpFiles = []*GspatialjpFile{{Kind: GspatialjpFileKindCityGML, URL: "https://example.com/old.zip"}}
	assert.NotEqual(t, a, computeContextRevision(withFiles))

	assert.Empty(t, computeContextRevision(nil))
}

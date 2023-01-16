package geospatialjp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCatalogFinalFileName(t *testing.T) {
	// TODO
}

func TestResources(t *testing.T) {
	// TODO
}

func TestExtractCityName(t *testing.T) {
	code, cityName, err := extractCityName("https://example.com/12210_mobara-shi_2022_citygml_1_lsld.zip")
	assert.NoError(t, err)
	assert.Equal(t, "12210", code)
	assert.Equal(t, "mobara-shi", cityName)

	code, cityName, err = extractCityName("aaa")
	assert.EqualError(t, err, "invalid file name")
	assert.Empty(t, code)
	assert.Empty(t, cityName)
}

func TestPackageFromCatalog(t *testing.T) {
	// TODO
}

package citygmlpacker

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetBasePath(t *testing.T) {
	assert.Equal(t, "hoge/foo.gml", getBasePath("/assets/xx/xxxxxx/hoge/foo.gml"))
	assert.Equal(t, "hoge/bar/foo.gml", getBasePath("/assets/xx/xxxxxx/hoge/bar/foo.gml"))
	assert.Equal(t, "foo.gml", getBasePath("/assets/xx/xxxxxx/foo.gml"))
	assert.Equal(t, "", getBasePath("/assets/xx/xxxxxx"))
}

func TestGetRootFromZipFileName(t *testing.T) {
	assert.Equal(t, "30406_susami-cho_city_2024_citygml_1_op", getRootFromZipFileName("30406_susami-cho_city_2024_citygml_1_op_codelists.zip"))
}

package citygmlpacker

import (
	"archive/zip"
	"bytes"
	"io"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPacker_Pack(t *testing.T) {
	const testgml1 = `<?xml version="1.0" encoding="UTF-8"?>` // no deps
	const testgml2 = `<?xml version="1.0" encoding="UTF-8"?>
<app:imageURI>image.png</app:imageURI>
<element codeSpace="../../codelists/dep.gml" />`
	const testgml3 = `<?xml version="1.0" encoding="UTF-8"?>`
	const testimg = `hoge` // it's not a real image but it doesn't matter

	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://example.com/hogehoge/example_citygml/udx/bldg/1.gml",
		httpmock.NewStringResponder(200, testgml1))
	httpmock.RegisterResponder("GET", "http://example.com/hogehoge/example_citygml/udx/bldg/2.gml",
		httpmock.NewStringResponder(200, testgml2))
	httpmock.RegisterResponder("GET", "http://example.com/hogehoge/example_citygml/codelists/dep.gml",
		httpmock.NewStringResponder(200, testgml3))
	httpmock.RegisterResponder("GET", "http://example.com/hogehoge/example_citygml/udx/bldg/image.png",
		httpmock.NewStringResponder(200, testimg))

	buf := bytes.NewBuffer(nil)
	urls := []string{
		"http://example.com/hogehoge/example_citygml/udx/bldg/1.gml",
		"http://example.com/hogehoge/example_citygml/udx/bldg/2.gml",
	}
	packer := NewPacker(buf, len(urls), nil)

	err := packer.Pack(t.Context(), "example.com", urls)
	require.NoError(t, err)

	// unzip
	zr, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	require.NoError(t, err)

	assert.Len(t, zr.File, 4)
	assert.Equal(t, "example_citygml/udx/bldg/1.gml", zr.File[0].Name)
	assert.Equal(t, "example_citygml/udx/bldg/2.gml", zr.File[1].Name)
	assert.Equal(t, "example_citygml/codelists/dep.gml", zr.File[2].Name)
	assert.Equal(t, "example_citygml/udx/bldg/image.png", zr.File[3].Name)

	b := string(lo.Must(io.ReadAll(lo.Must(zr.File[0].Open()))))
	assert.Equal(t, testgml1, b, "1.gml")

	b = string(lo.Must(io.ReadAll(lo.Must(zr.File[1].Open()))))
	assert.Equal(t, testgml2, b, "2.gml")

	b = string(lo.Must(io.ReadAll(lo.Must(zr.File[2].Open()))))
	assert.Equal(t, testgml3, b, "dep.gml")

	b = string(lo.Must(io.ReadAll(lo.Must(zr.File[3].Open()))))
	assert.Equal(t, testimg, b, "image.png")
}

func TestFindDeps(t *testing.T) {
	gml := `<?xml version="1.0" encoding="UTF-8"?>
<Root
    xmlns:app="http://mydomain.org/app"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.my.domain/gml ../schemas/my.xsd">
    <app:imageURI>some-image.png</app:imageURI>
    <someElement codeSpace="my-codespace" />
</Root>`

	depsMap := make(map[string]struct{})
	err := findDeps(strings.NewReader(gml), depsMap)

	require.NoError(t, err)
	assert.Equal(t, map[string]struct{}{
		"some-image.png":    {},
		"my-codespace":      {},
		"../schemas/my.xsd": {},
	}, depsMap)
}

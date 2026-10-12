package ckan

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPackageResources_ResourceList(t *testing.T) {
	var p PackageResources
	require.NoError(t, json.Unmarshal([]byte(`{
		"name": "a",
		"num_resources": [2],
		"res_name": ["n1", "n2"],
		"res_url": ["u1", "u2"],
		"res_format": ["ZIP", ""]
	}`), &p))
	res, ok := p.ResourceList()
	assert.True(t, ok)
	assert.Equal(t, []Resource{{Name: "n1", URL: "u1", Format: "ZIP"}, {Name: "n2", URL: "u2", Format: ""}}, res)

	// an empty URL is dropped by Solr
	require.NoError(t, json.Unmarshal([]byte(`{
		"name": "a",
		"num_resources": 2,
		"res_name": ["n1", "n2"],
		"res_url": ["u2"],
		"res_format": ["ZIP", "ZIP"]
	}`), &p))
	res, ok = p.ResourceList()
	assert.False(t, ok)
	assert.Nil(t, res)

	// full packages when fl is ignored
	p = PackageResources{Resources: []Resource{{Name: "n1", URL: "u1"}}}
	res, ok = p.ResourceList()
	assert.True(t, ok)
	assert.Equal(t, []Resource{{Name: "n1", URL: "u1"}}, res)

	// no resources
	res, ok = PackageResources{}.ResourceList()
	assert.True(t, ok)
	assert.Empty(t, res)
}

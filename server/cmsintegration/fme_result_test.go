package cmsintegration

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFMEResult_GetResult(t *testing.T) {
	assert.Equal(t, "https://example.com", fmeResult{
		Results: map[string]string{
			"*": "https://example.com",
		},
	}.GetResult("-", "*"))
	assert.Equal(t, "", fmeResult{
		Results: map[string]string{
			"**": "https://example.com",
		},
	}.GetResult("-", "*"))
}

func TestFMEResult_GetResultFromAllLOD(t *testing.T) {
	assert.Equal(t, "https://example.com", fmeResult{
		Results: map[string]string{
			"bldg": "https://example.com",
		},
	}.GetResultFromAllLOD("bldg"))
	assert.Equal(t, "https://example.com", fmeResult{
		Results: map[string]string{
			"bldg_lod1": "https://example.com",
		},
	}.GetResultFromAllLOD("bldg"))
	assert.Equal(t, "https://example.com", fmeResult{
		Results: map[string]string{
			"bldg_lod2": "https://example.com",
		},
	}.GetResultFromAllLOD("bldg"))
	assert.Equal(t, "https://example.com", fmeResult{
		Results: map[string]string{
			"bldg_lod3": "https://example.com",
		},
	}.GetResultFromAllLOD("bldg"))
	assert.Equal(t, "", fmeResult{
		Results: map[string]string{
			"*": "https://example.com",
		},
	}.GetResultFromAllLOD("bldg"))
}

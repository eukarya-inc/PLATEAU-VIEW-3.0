package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCompleteOptionalFlagValues(t *testing.T) {
	assert.Equal(t,
		[]string{"bin", "--export-asset-index=all", "--stdout"},
		completeOptionalFlagValues([]string{"bin", "--export-asset-index", "--stdout"}, "generate-datacatalog", "export-asset-index"),
	)
	assert.Equal(t,
		[]string{"bin", "--generate-datacatalog=all"},
		completeOptionalFlagValues([]string{"bin", "-generate-datacatalog"}, "generate-datacatalog", "export-asset-index"),
	)
	assert.Equal(t,
		[]string{"bin", "--export-asset-index", "plateau-2025", "--output", "gs://b"},
		completeOptionalFlagValues([]string{"bin", "--export-asset-index", "plateau-2025", "--output", "gs://b"}, "generate-datacatalog", "export-asset-index"),
	)
	assert.Equal(t,
		[]string{"bin", "--export-asset-index=plateau-2025"},
		completeOptionalFlagValues([]string{"bin", "--export-asset-index=plateau-2025"}, "generate-datacatalog", "export-asset-index"),
	)
}

func TestParseProjectsFlag(t *testing.T) {
	assert.Nil(t, parseProjectsFlag(""))
	assert.Nil(t, parseProjectsFlag("all"))
	assert.Equal(t, []string{"plateau-2024", "plateau-2025"}, parseProjectsFlag(" plateau-2024, ,plateau-2025 "))
}

func TestAssetIndexExporter_LocalCache(t *testing.T) {
	src := t.TempDir()
	out := t.TempDir()

	const asset = "https://assets.cms.plateau.reearth.io/assets/ef/b49016-be67-4c5e-a3b2-1234567890ab"
	repoCtx := &plateauapi.InMemoryRepoContext{
		Name: "plateau-2025",
		CityGML: map[plateauapi.ID]*plateauapi.CityGMLDataset{
			"cg_13104": {
				ID:       "cg_13104",
				Year:     2025,
				CityCode: "13104",
				URL:      asset + "/13104_citygml.zip",
				GspatialjpFiles: []*plateauapi.GspatialjpFile{
					{Kind: plateauapi.GspatialjpFileKind3DTilesMVT, URL: "https://example.com/not-an-asset.zip"},
				},
			},
		},
	}
	b, err := json.Marshal(repoCtx)
	require.NoError(t, err)
	require.NoError(t, os.WriteFile(filepath.Join(src, "repo_plateau-2025.json"), b, 0644))

	e := NewAssetIndexExporter(&Config{}, AssetIndexExporterOptions{SourceURL: src, OutputURL: out})
	require.NoError(t, e.Export(context.Background()))

	data, err := os.ReadFile(filepath.Join(out, "asset-index", "assets.ndjson"))
	require.NoError(t, err)
	lines := strings.Split(strings.TrimSpace(string(data)), "\n")
	require.Len(t, lines, 1)

	var row map[string]any
	require.NoError(t, json.Unmarshal([]byte(lines[0]), &row))
	assert.Equal(t, "ef/b49016-be67-4c5e-a3b2-1234567890ab", row["uuid"])
	assert.Equal(t, asset, row["url"])
	ref := row["refs"].([]any)[0].(map[string]any)
	assert.Equal(t, "citygml", ref["kind"])
	assert.Equal(t, "plateau-2025", ref["project"])

	// a project that is not in the cache is an error rather than an empty export
	e = NewAssetIndexExporter(&Config{}, AssetIndexExporterOptions{Projects: []string{"plateau-1999"}, SourceURL: src, OutputURL: out})
	assert.ErrorContains(t, e.Export(context.Background()), "plateau-1999")
}

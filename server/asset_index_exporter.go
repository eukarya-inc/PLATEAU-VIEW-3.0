package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/assetindex"
	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/datacatalogv3"
	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/PLATEAU-VIEW/server/plateaucms"
	"github.com/reearth/reearthx/log"
)

// assetIndexPath is the path of the asset index export relative to --output.
const assetIndexPath = "asset-index/assets.ndjson"

type AssetIndexExporterOptions struct {
	// Projects to export. Empty means all projects available in the source.
	Projects []string
	// SourceURL is a datacatalog cache location (gs://bucket/path or a local
	// directory) written by --generate-datacatalog. When empty, the catalog is
	// built from CMS like --generate-datacatalog does.
	SourceURL      string
	OutputURL      string // gs://bucket/path or a local directory (default: current directory)
	OutputToStdout bool
}

// AssetIndexExporter writes an NDJSON file with one row per CMS asset UUID
// that maps the asset to the data catalog entries pointing at it. See the
// assetindex package for the row format.
type AssetIndexExporter struct {
	config *Config
	opts   AssetIndexExporterOptions
}

func NewAssetIndexExporter(config *Config, opts AssetIndexExporterOptions) *AssetIndexExporter {
	return &AssetIndexExporter{config: config, opts: opts}
}

func (e *AssetIndexExporter) Export(ctx context.Context) error {
	var projects []assetindex.Project
	var err error
	if e.opts.SourceURL != "" {
		projects, err = e.loadFromCache(ctx)
	} else {
		projects, err = e.loadFromCMS(ctx)
	}
	if err != nil {
		return err
	}

	names := make([]string, 0, len(projects))
	for _, p := range projects {
		names = append(names, p.Name)
	}
	log.Infof("asset index: building from %d project(s): %v", len(projects), names)

	res, err := assetindex.Build(ctx, projects)
	if err != nil {
		return fmt.Errorf("failed to build asset index: %w", err)
	}

	dest, err := e.write(ctx, res)
	if err != nil {
		return err
	}

	// stderr にも出しておく（--stdout のときは標準出力が NDJSON 本体になるため）
	fmt.Fprintf(os.Stderr, "asset index: rows=%d refs=%d skipped_non_asset_urls=%d output=%s\n", len(res.Rows), res.Refs, res.Skipped, dest)
	return nil
}

func (e *AssetIndexExporter) wants(project string) bool {
	return len(e.opts.Projects) == 0 || slices.Contains(e.opts.Projects, project)
}

func (e *AssetIndexExporter) loadFromCache(ctx context.Context) ([]assetindex.Project, error) {
	reader, err := datacatalogv3.NewRepoReaderFromURL(ctx, e.opts.SourceURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create cache reader: %w", err)
	}
	defer func() {
		_ = reader.Close()
	}()

	available, err := reader.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list cached projects: %w", err)
	}
	slices.Sort(available)

	var res []assetindex.Project
	for _, p := range available {
		if !e.wants(p) {
			continue
		}
		repoCtx, err := reader.Load(ctx, p)
		if err != nil {
			return nil, fmt.Errorf("failed to load cache for %s: %w", p, err)
		}
		res = append(res, assetindex.Project{Name: p, Repo: plateauapi.NewInMemoryRepo(repoCtx)})
	}

	if missing := e.missing(res); len(missing) > 0 {
		return nil, fmt.Errorf("projects not found in %s: %v", e.opts.SourceURL, missing)
	}
	return res, nil
}

func (e *AssetIndexExporter) loadFromCMS(ctx context.Context) ([]assetindex.Project, error) {
	// --generate-datacatalog と同じ方法で CMS からカタログを構築する
	g := NewDatacatalogGenerator(e.config, DatacatalogGeneratorOptions{})
	if err := g.initializePCMS(); err != nil {
		return nil, fmt.Errorf("failed to initialize PLATEAU CMS: %w", err)
	}

	allMetadata, err := g.pcms.AllMetadata(ctx, true)
	if err != nil {
		return nil, fmt.Errorf("failed to get metadata: %w", err)
	}
	ctx = plateaucms.SetAllCMSMetadataFromContext(ctx, allMetadata)

	var names []string
	for _, m := range allMetadata.V3Projects() {
		if e.wants(m.DataCatalogProjectAlias) {
			names = append(names, m.DataCatalogProjectAlias)
		}
	}
	slices.Sort(names)

	repos := datacatalogv3.NewRepos(g.pcms)
	if e.config.Host != "" {
		repos.SetHost(e.config.Host)
	}

	var res []assetindex.Project
	for _, name := range names {
		cmsInterface, err := g.getCMSInterface(allMetadata, name)
		if err != nil {
			return nil, fmt.Errorf("failed to get CMS interface for %s: %w", name, err)
		}

		start := time.Now()
		if err := repos.Prepare(ctx, name, g.extractYear(name), g.isPlateau(name), cmsInterface); err != nil {
			return nil, fmt.Errorf("failed to prepare repository for %s: %w", name, err)
		}
		log.Infof("asset index: fetched %s from CMS in %.1fs", name, time.Since(start).Seconds())

		if r := repos.Repo(name); r != nil {
			res = append(res, assetindex.Project{Name: name, Repo: r})
		}
	}

	if missing := e.missing(res); len(missing) > 0 {
		return nil, fmt.Errorf("projects not found in CMS: %v", missing)
	}
	return res, nil
}

func (e *AssetIndexExporter) missing(found []assetindex.Project) (res []string) {
	for _, p := range e.opts.Projects {
		if !slices.ContainsFunc(found, func(f assetindex.Project) bool { return f.Name == p }) {
			res = append(res, p)
		}
	}
	return
}

// write writes the NDJSON to stdout, GCS or a local directory and returns a
// human-readable destination.
func (e *AssetIndexExporter) write(ctx context.Context, res *assetindex.Result) (string, error) {
	if e.opts.OutputToStdout {
		if err := res.WriteNDJSON(os.Stdout); err != nil {
			return "", fmt.Errorf("failed to write asset index to stdout: %w", err)
		}
		return "stdout", nil
	}

	var w io.WriteCloser
	var dest string
	if strings.HasPrefix(e.opts.OutputURL, "gs://") {
		storage, err := datacatalogv3.NewGCSStorage(ctx, e.opts.OutputURL)
		if err != nil {
			return "", fmt.Errorf("failed to create GCS storage: %w", err)
		}
		defer func() {
			_ = storage.Close()
		}()
		w = storage.GetFileWriter(ctx, assetIndexPath, "application/x-ndjson")
		dest = strings.TrimSuffix(e.opts.OutputURL, "/") + "/" + assetIndexPath
	} else {
		base := e.opts.OutputURL
		if base == "" {
			base = "."
		}
		dest = filepath.Join(base, filepath.FromSlash(assetIndexPath))
		if err := os.MkdirAll(filepath.Dir(dest), 0755); err != nil {
			return "", fmt.Errorf("failed to create output directory: %w", err)
		}
		f, err := os.Create(dest)
		if err != nil {
			return "", fmt.Errorf("failed to create output file: %w", err)
		}
		w = f
	}

	if err := res.WriteNDJSON(w); err != nil {
		_ = w.Close()
		return "", fmt.Errorf("failed to write asset index to %s: %w", dest, err)
	}
	// GCS のアップロードは Close で確定するのでエラーを見落とさない
	if err := w.Close(); err != nil {
		return "", fmt.Errorf("failed to finish writing asset index to %s: %w", dest, err)
	}
	return dest, nil
}

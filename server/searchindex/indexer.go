package searchindex

import (
	"archive/zip"
	"context"
	"fmt"
	"io"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/searchindex/indexer"
)

var builtinConfig = &indexer.Config{
	IdProperty: "gml_id",
	Indexes: map[string]indexer.Index{
		"名称":           {Kind: "enum"},
		"用途":           {Kind: "enum"},
		"住所":           {Kind: "enum"},
		"建物利用現況（大分類）":  {Kind: "enum"},
		"建物利用現況（中分類）":  {Kind: "enum"},
		"建物利用現況（小分類）":  {Kind: "enum"},
		"建物利用現況（詳細分類）": {Kind: "enum"},
		"構造種別":         {Kind: "enum"},
		"構造種別（独自）":     {Kind: "enum"},
		"耐火構造種別":       {Kind: "enum"},
	},
}

type Indexer struct {
	i      *indexer.Indexer
	config *indexer.Config
	cms    cms.Interface
	pid    string
}

func NewIndexer(cms cms.Interface, pid, base string) *Indexer {
	return &Indexer{
		i:      indexer.NewIndexer(builtinConfig, indexer.NewHTTPFS(nil, base), nil),
		config: builtinConfig,
		cms:    cms,
		pid:    pid,
	}
}

func (i *Indexer) BuildIndex(ctx context.Context, name string) (string, error) {
	res, err := i.i.Build()
	if err != nil {
		return "", fmt.Errorf("インデックスを作成できませんでした。 %w", err)
	}

	pr, pw := io.Pipe()

	aids := make(chan string)
	errs := make(chan error)
	go func() {
		aid, err := i.cms.UploadAssetDirectly(ctx, i.pid, fmt.Sprintf("%s_index.zip", name), pr)
		aids <- aid
		errs <- err
	}()

	zw := zip.NewWriter(pw)
	zfs := indexer.NewZipOutputFS(zw, "")
	if err := indexer.NewWriter(i.config, zfs).Write(res); err != nil {
		return "", fmt.Errorf("failed to save files to zip: %w", err)
	}

	if err := zw.Close(); err != nil {
		return "", fmt.Errorf("failed to close zip: %w", err)
	}

	if err := pw.Close(); err != nil {
		return "", fmt.Errorf("結果のアップロードに失敗しました。(2) %w", err)
	}

	aid := <-aids
	err = <-errs
	if err != nil {
		return "", fmt.Errorf("結果のアップロードに失敗しました。(3) %w", err)
	}
	return aid, nil
}

package searchindex

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/eukarya-inc/reearth-plateauview/server/indexer"
)

type Indexer struct {
	i    *indexer.Indexer
	base string
}

func NewIndexer(base string) *Indexer {
	return &Indexer{
		i:    indexer.NewIndexer(),
		base: base,
	}
}

type Result struct {
	Name string
	Data []byte
}

func (i *Indexer) BuildIndex() ([]Result, error) {
	// fs := NewIndexerFS(i.base)

	// r, err := i.i.GenerateIndexes(&indexer.Config{}, "", fs)
	// if err != nil {
	// 	return Result{}, err
	// }

	return nil, errors.New("not implemented")
}

type IndexerFS struct {
	c    *http.Client
	base string
}

type IndexerFile struct {
	p string
	r *http.Response
}

func NewIndexerFS(base string) *IndexerFS {
	return &IndexerFS{
		c:    http.DefaultClient,
		base: base,
	}
}

func (f *IndexerFS) Open(p string) (io.ReadCloser, error) {
	u, err := url.JoinPath(f.base, p)
	if err != nil {
		return nil, fmt.Errorf("invalid url: %w", err)
	}

	r, err := f.c.Get(u)
	if err != nil {
		return nil, fmt.Errorf("failed to open url: %w", err)
	}

	if r.StatusCode != 200 {
		_ = r.Body.Close()
		return nil, fmt.Errorf("failed to open url: invalid status code: %d", r.StatusCode)
	}

	return &IndexerFile{
		p: p,
		r: r,
	}, nil
}

func (f *IndexerFile) Read(b []byte) (int, error) {
	return f.r.Body.Read(b)
}

func (f *IndexerFile) Close() error {
	return f.r.Body.Close()
}

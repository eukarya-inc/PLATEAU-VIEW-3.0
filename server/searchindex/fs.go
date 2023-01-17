package searchindex

import (
	"context"
	"io"
	"path"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/searchindex/indexer"
)

type OutputFS struct {
	c   cms.Interface
	cb  func(assetID string, err error)
	ctx context.Context
	pid string
}

func NewOutputFS(ctx context.Context, c cms.Interface, projectID string, cb func(assetID string, err error)) *OutputFS {
	return &OutputFS{
		c:   c,
		cb:  cb,
		ctx: ctx,
		pid: projectID,
	}
}

func (f *OutputFS) Open(p string) (indexer.WriteCloser, error) {
	pr, pw := io.Pipe()

	go func() {
		f.cb(f.c.UploadAssetDirectly(f.ctx, f.pid, path.Base(p), pr))
	}()

	return pw, nil
}

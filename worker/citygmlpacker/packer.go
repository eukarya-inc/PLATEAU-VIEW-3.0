package citygmlpacker

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"slices"
	"sort"
	"strings"
	"time"
)

type Packer struct {
	w          io.Writer
	p          progress
	cachedir   string
	httpClient *http.Client
}

func NewPacker(w io.Writer, c *http.Client) *Packer {
	if c == nil {
		c = &http.Client{}
	}
	return &Packer{
		w:          w,
		p:          progress{},
		cachedir:   filepath.Join(os.TempDir(), "reearth-plateauview"),
		httpClient: c,
	}
}

func (p *Packer) Progress() *progress {
	return &p.p
}

func (p *Packer) Pack(ctx context.Context, host string, urls []string) error {
	p.p.Reset(int64(len(urls) * 2))

	// sort urls by extension (.gml -> .zip)
	urls = sortURLs(urls)

	// pre-parsing gmlURLs to make sure there are no unauthorized hosts
	var q []string
	q = append(q, urls...)

	seen := map[string]struct{}{}
	roots := map[string]struct{}{}

	t := time.Now()

	zw := zip.NewWriter(p.w)
	defer zw.Close()
	for len(q) > 0 {
		var nq []string
		for _, uu := range q {
			u, err := url.Parse(uu)
			if err != nil {
				return fmt.Errorf("invalid URL: %w", err)
			}

			if u.Scheme != "http" && u.Scheme != "https" {
				return fmt.Errorf("invalid scheme: %s", u.Scheme)
			}

			if u.Host == "" || (host != "" && u.Host != host) {
				return fmt.Errorf("invalid host: %s", u.Host)
			}

			if ext := path.Ext(u.Path); ext == ".zip" {
				if err := p.writeZipFilesToZip(ctx, zw, u, roots); err != nil {
					return fmt.Errorf("write zip: %w", err)
				}
			} else if ext == ".gml" {
				nq, err = p.writeGMLToZip(ctx, t, zw, u, nq, seen, roots)
				if err != nil {
					return fmt.Errorf("write gml: %w", err)
				}
			} else {
				return fmt.Errorf("invalid extension: %s", ext)
			}
		}
		q = nq
	}

	if err := zw.Close(); err != nil {
		return fmt.Errorf("close zip: %w", err)
	}

	return nil
}

func sortURLs(urls []string) []string {
	urls = slices.Clone(urls)
	sort.SliceStable(urls, func(i, j int) bool {
		return !strings.HasSuffix(urls[i], ".zip") && strings.HasSuffix(urls[j], ".zip")
	})
	return urls
}

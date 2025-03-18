package citygmlpacker

import (
	"archive/zip"
	"context"
	"fmt"
	"net/url"
	"os"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/worker/workerutil"
	"github.com/reearth/reearthx/log"
)

func (p *Packer) writeZipFilesToZip(ctx context.Context, zw *zip.Writer, u *url.URL, roots map[string]struct{}) error {
	upath := getBasePath(u.Path)
	if upath == "" {
		return fmt.Errorf("invalid path: %s", u.String())
	}

	ustr := u.String()
	uext := path.Ext(upath)
	if uext != ".zip" {
		return fmt.Errorf("invalid extension: %s", uext)
	}

	uname := strings.TrimSuffix(path.Base(ustr), uext)
	root := findRoot(uname, roots)
	if root == "" {
		return fmt.Errorf("invalid zip file name: %s", ustr)
	}

	body, err := httpGet(ctx, p.httpClient, ustr)
	if body != nil {
		defer body.Close()
	}
	if err != nil {
		return fmt.Errorf("get: %w", err)
	}
	if u == nil {
		log.Warnf("skipped download: %s", ustr)
		return nil // skip
	}

	log.Infofc(ctx, "downloading %s", ustr)

	zz := workerutil.NewZip2zip(zw).SkipMkdir(true)
	err = workerutil.DownloadAndConsumeZip(ctx, ustr, p.cachedir, func(zr *zip.Reader, fi os.FileInfo) error {
		log.Infofc(ctx, "unzipping %d files from %s", len(zr.File), ustr)
		p.p.AddDep(int64(len(zr.File)))
		defer p.p.DepEnd()

		return zz.Run(zr, func(f *zip.File) (string, error) {
			defer p.p.DepOne()

			name := workerutil.NormalizeZipFilePath(f.Name)
			if name == "" {
				log.Infofc(ctx, "%s -> (skipped)", f.Name)
				return "", nil // ignore
			}

			paths := strings.Split(name, "/")
			if len(paths) == 0 {
				log.Infofc(ctx, "%s -> (skipped)", f.Name)
				return "", nil // ignore
			}

			if paths[0] == uname {
				if len(paths) < 2 {
					log.Infofc(ctx, "%s -> (skipped)", f.Name)
					return "", nil // ignore
				}
				paths = paths[1:]
			}
			if paths[0] == "misc" {
				paths = paths[1:]
			}

			name = strings.Join(paths, "/")
			res := path.Join(root, name)

			log.Infofc(ctx, "%s -> %s", f.Name, res)
			return res, nil
		})
	})

	if err != nil {
		return fmt.Errorf("zip2zip: %w", err)
	}

	return nil
}

// /assets/xx/xxxxxx/hoge/foo.gml -> /hoge/foo.gml
func getBasePath(p string) string {
	parts := strings.SplitN(p, "/", 5)
	if len(parts) != 5 {
		return ""
	}
	return path.Join(parts[4:]...)
}

func findRoot(s string, roots map[string]struct{}) string {
	code, _, ok := strings.Cut(s, "_")
	if !ok {
		return ""
	}

	// c should be numeric
	for _, c := range code {
		if c < '0' || c > '9' {
			return ""
		}
	}

	code = code + "_"
	for r := range roots {
		if strings.HasPrefix(r, code) {
			return r
		}
	}

	return ""
}

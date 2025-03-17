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
	"strings"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/worker/workerutil"
	"github.com/orisano/gosax/xmlb"
	"github.com/reearth/reearthx/log"
)

type Packer struct {
	w        io.Writer
	p        progress
	cachedir string

	httpClient *http.Client
}

func NewPacker(w io.Writer, counts int, c *http.Client) *Packer {
	if c == nil {
		c = &http.Client{}
	}
	return &Packer{
		w: w,
		p: progress{
			steps: int64(counts) * 2,
		},
		cachedir:   filepath.Join(os.TempDir(), "reearth-plateauview"),
		httpClient: c,
	}
}

func (p *Packer) Progress() *progress {
	return &p.p
}

func (p *Packer) Pack(ctx context.Context, host string, urls []string) error {
	// pre-parsing gmlURLs to make sure there are no unauthorized hosts
	var q []string
	q = append(q, urls...)

	seen := map[string]struct{}{}

	t := time.Now()

	zw := zip.NewWriter(p.w)
	defer zw.Close()
	for len(q) > 0 {
		var nq []string
		for _, gmlURL := range q {
			u, err := url.Parse(gmlURL)
			if err != nil {
				return fmt.Errorf("invalid gml URL: %w", err)
			}

			if u.Scheme != "http" && u.Scheme != "https" {
				return fmt.Errorf("invalid scheme: %s", u.Scheme)
			}

			if u.Host == "" || (host != "" && u.Host != host) {
				return fmt.Errorf("invalid host: %s", u.Host)
			}

			if ext := path.Ext(u.Path); ext == ".zip" {
				if err := p.writeZipFilesToZip(ctx, zw, u); err != nil {
					return fmt.Errorf("write zip: %w", err)
				}
			} else if ext == ".gml" {
				nq, err = p.writeGMLToZip(ctx, t, zw, u, nq, seen)
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

func (p *Packer) writeGMLToZip(ctx context.Context, t time.Time, zw *zip.Writer, u *url.URL, q []string, seen map[string]struct{}) ([]string, error) {
	upath := getBasePath(u.Path)
	if upath == "" {
		return nil, fmt.Errorf("invalid path: %s", u.String())
	}

	uext := path.Ext(upath)
	if uext != ".gml" {
		return nil, fmt.Errorf("invalid extension: %s", uext)
	}

	root := path.Dir(upath)
	depsMap := map[string]struct{}{}
	ustr := u.String()

	body, err := httpGet(ctx, p.httpClient, ustr)
	if body != nil {
		defer body.Close()
	}
	if err != nil {
		return nil, fmt.Errorf("get: %w", err)
	}
	if u == nil {
		log.Warnf("skipped download: %s", ustr)
		return q, nil // skip
	}

	ze, err := zw.CreateHeader(&zip.FileHeader{
		Name:     upath,
		Method:   zip.Deflate,
		Modified: t,
	})
	if err != nil {
		return nil, fmt.Errorf("create: %w", err)
	}

	log.Infof("parsing... %s", ustr)

	if err := findDeps(io.TeeReader(body, ze), depsMap); err != nil {
		return nil, fmt.Errorf("findDeps: %w", err)
	}

	deps := depsMapToSlice(depsMap, seen, u)

	log.Infof("completed %s (%d deps)", ustr, len(deps))

	p.p.AddDep(int64(len(deps)))
	defer p.p.DepEnd()

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	downloads, err := DownloadsFromUrls(ctx, deps, u)
	if err != nil {
		return nil, fmt.Errorf("downloadsFromUrls: %w", err)
	}

	go func() {
		sem := make(chan struct{}, 512)
		for _, d := range downloads {
			select {
			case sem <- struct{}{}:
			case <-ctx.Done():
				return
			}

			d := d
			go func() {
				defer func() {
					<-sem
				}()

				if d.Download(p.httpClient) {
					log.Infof("downloaded: %s", d.URL())
				} else if d.Err() == nil {
					log.Warnf("skipped download: %s", d.URL())
				}
			}()
		}
	}()

	for _, d := range downloads {
		if err := d.WriteToZip(zw, root); err != nil {
			return nil, err
		}

		p.p.DepOne()
	}

	return q, nil
}

func (p *Packer) writeZipFilesToZip(ctx context.Context, zw *zip.Writer, u *url.URL) error {
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
	root := getRootFromZipFileName(path.Base(upath))
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
			name := workerutil.NormalizeZipFilePath(f.Name)
			if name == "" {
				return "", nil // ignore
			}

			paths := strings.Split(name, "/")
			if len(paths) == 0 {
				return "", nil // ignore
			}

			if paths[0] == uname {
				name = strings.Join(paths[1:], "/")
			}
			res := path.Join(root, name)

			log.Infofc(ctx, "%s -> %s", f.Name, res)
			p.p.DepOne()

			return res, nil
		})
	})
	if err != nil {
		return fmt.Errorf("zip2zip: %w", err)
	}

	return nil
}

func findDeps(gml io.Reader, depsMap map[string]struct{}) error {
	dec := xmlb.NewDecoder(gml, make([]byte, 32*1024))

	for {
		tok, err := dec.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := tok.StartElement()
			if err != nil {
				return err
			}

			if el.Name.Space == "app" && el.Name.Local == "imageURI" {
				uri, err := dec.Text()
				if err != nil {
					return err
				}
				depsMap[uri] = struct{}{}
			}

			for _, a := range el.Attr {
				if a.Name.Space == "" && a.Name.Local == "codeSpace" {
					depsMap[a.Value] = struct{}{}
				}

				if a.Name.Space == "xsi" && a.Name.Local == "schemaLocation" {
					s := a.Value
					for _, v := range strings.Fields(s) {
						u, err := url.Parse(v)
						if err != nil {
							return fmt.Errorf("invalid schemaLocation: %w", err)
						}
						if u.Scheme == "" {
							depsMap[u.Path] = struct{}{}
						}
					}
				}
			}
		}
	}

	return nil
}

func depsMapToSlice(depsMap, seen map[string]struct{}, u *url.URL) []string {
	deps := make([]string, 0, len(depsMap))
	for dep := range depsMap {
		u := *u
		dir := path.Dir(u.Path)
		u.Path = path.Join(dir, dep)
		if _, ok := seen[u.String()]; ok {
			continue
		}
		seen[u.String()] = struct{}{}
		deps = append(deps, dep)
	}
	slices.Sort(deps)
	return deps
}

// /assets/xx/xxxxxx/hoge/foo.gml -> /hoge/foo.gml
func getBasePath(p string) string {
	parts := strings.SplitN(p, "/", 5)
	if len(parts) != 5 {
		return ""
	}
	return path.Join(parts[4:]...)
}

// 30406_susami-cho_city_2024_citygml_1_op_codelists.zip -> 30406_susami-cho_city_2024_citygml_1_op
func getRootFromZipFileName(s string) string {
	b, _, _ := splitAtLastN(s, "_", 1)
	return b
}

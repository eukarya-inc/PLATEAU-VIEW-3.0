package citygmlpacker

import (
	"archive/zip"
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"slices"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/eukarya-inc/reearth-plateauview/server/citygml"
	"github.com/klauspost/compress/gzip"
	"github.com/orisano/gosax/xmlb"
	"github.com/reearth/reearthx/log"
	"google.golang.org/api/googleapi"
)

func Run(conf Config) (err error) {
	ctx := context.Background()
	destURL, err := url.Parse(conf.Dest)
	if err != nil {
		return fmt.Errorf("invalid destination bucket(%s): %w", conf.Dest, err)
	}

	gcs, err := storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("storage.NewClient: %v", err)
	}

	obj := gcs.Bucket(destURL.Host).Object(path.Join(strings.TrimPrefix(destURL.Path, "/")))

	defer func() {
		if err == nil {
			return
		}
		_, uErr := obj.Update(ctx, storage.ObjectAttrsToUpdate{
			Metadata: citygml.Status(PackStatusFailed),
		})
		if uErr != nil {
			log.Printf("failed to update status: (to=%s): %v", PackStatusFailed, uErr)
		}
	}()

	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return fmt.Errorf("get metadata: %v", err)
	}

	if status := getStatus(attrs.Metadata); status != PackStatusAccepted {
		log.Printf("SKIPPED: already exists (status=%s)", status)
		return nil
	}

	_, err = obj.If(storage.Conditions{GenerationMatch: attrs.Generation, MetagenerationMatch: attrs.Metageneration}).
		Update(ctx, storage.ObjectAttrsToUpdate{Metadata: status(PackStatusProcessing)})
	if err != nil {
		var gErr *googleapi.Error
		if !(errors.As(err, &gErr) && gErr.Code == http.StatusPreconditionFailed) {
			log.Printf("SKIPPED: someone else is processing")
			return nil
		}
		return fmt.Errorf("update metadata: %v", err)
	}

	w := obj.NewWriter(ctx)
	w.ObjectAttrs.Metadata = citygml.Status(PackStatusSucceeded)
	defer w.Close()
	if err := pack(ctx, w, conf.Domain, conf.URLs); err != nil {
		return fmt.Errorf("pack: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("close object writer: %v", err)
	}
	return nil
}

func pack(ctx context.Context, w io.Writer, host string, gmlURLs []string) error {
	// gmlURLs をあらかじめパースして許可されていないホストがないことを確認する
	var q []string
	q = append(q, gmlURLs...)

	var httpClient http.Client

	seen := map[string]struct{}{}

	zw := zip.NewWriter(w)
	defer zw.Close()
	for len(q) > 0 {
		var nq []string
		for _, gmlURL := range q {
			u, err := url.Parse(gmlURL)
			if err != nil {
				return fmt.Errorf("invalid gml URL: %w", err)
			}

			if host != "" && u.Host != host {
				return fmt.Errorf("invalid host: %s", u.Host)
			}

			nq, err = writeZip(ctx, zw, &httpClient, u, nq, seen)
			if err != nil {
				return fmt.Errorf("writeZip: %w", err)
			}
		}
		q = nq
	}
	if err := zw.Close(); err != nil {
		return fmt.Errorf("close zip: %w", err)
	}
	return nil
}

func writeZip(ctx context.Context, zw *zip.Writer, httpClient *http.Client, u *url.URL, q []string, seen map[string]struct{}) ([]string, error) {
	depsMap := map[string]struct{}{}
	gml := strings.SplitN(u.Path, "/", 5)[4]
	root := path.Dir(gml)

	ze, err := zw.Create(gml)
	if err != nil {
		return nil, fmt.Errorf("create: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("invalid url: %w", err)
	}
	req.Header.Set("Accept-Encoding", "gzip")

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request gml: %w", err)
	}
	defer resp.Body.Close()

	var r io.Reader = resp.Body
	if resp.Header.Get("Content-Encoding") == "gzip" {
		gr, err := gzip.NewReader(r)
		if err != nil {
			return nil, fmt.Errorf("gzip.NewReader: %w", err)
		}
		defer gr.Close()
		r = gr
	}

	log.Infof("parsing... %s", req.URL)
	dec := xmlb.NewDecoder(io.TeeReader(r, ze), make([]byte, 32*1024))
	for {
		tok, err := dec.Token()
		if err == io.EOF {
			break
		}
		switch tok.Type() {
		case xmlb.StartElement:
			el, err := tok.StartElement()
			if err != nil {
				return nil, err
			}

			if el.Name.Space == "app" && el.Name.Local == "imageURI" {
				uri, err := dec.Text()
				if err != nil {
					return nil, err
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
							return nil, fmt.Errorf("invalid schemaLocation: %w", err)
						}
						if u.Scheme == "" {
							depsMap[u.Path] = struct{}{}
						}
					}
				}
			}
		}
	}
	log.Infof("completed %s", req.URL)

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

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	type download struct {
		dep string
		req *http.Request
		pr  *io.PipeReader
		pw  *io.PipeWriter
	}
	downloads := make([]*download, 0, len(deps))

	for _, dep := range deps {
		u := *u
		dir := path.Dir(u.Path)
		u.Path = path.Join(dir, dep)
		req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
		if err != nil {
			return nil, fmt.Errorf("invalid url: %w", err)
		}
		pr, pw := io.Pipe()
		downloads = append(downloads, &download{
			dep: dep,
			req: req,
			pr:  pr,
			pw:  pw,
		})
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
				bw := bufio.NewWriterSize(d.pw, 2*1024*1024)
				defer func() {
					<-sem
				}()
				resp, err := httpClient.Do(d.req)
				if err != nil {
					_ = d.pw.CloseWithError(err)
					return
				}
				if resp.StatusCode != http.StatusOK {
					_ = d.pw.CloseWithError(fmt.Errorf("status code: %d", resp.StatusCode))
					return
				}
				if _, err := io.Copy(bw, resp.Body); err != nil {
					_ = d.pw.CloseWithError(err)
					return
				}
				log.Infof("downloaded: %s", d.req.URL)
				_ = d.pw.CloseWithError(bw.Flush())
			}()
		}
	}()

	for _, d := range downloads {
		w, err := zw.Create(path.Join(root, d.dep))
		if err != nil {
			return nil, fmt.Errorf("create: %w", err)
		}
		if _, err := io.Copy(w, d.pr); err != nil {
			return nil, fmt.Errorf("copy: %w", err)
		}
	}

	return q, nil
}

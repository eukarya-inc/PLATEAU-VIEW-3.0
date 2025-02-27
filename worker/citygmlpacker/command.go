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
	"strconv"
	"strings"
	"sync"
	"time"

	"cloud.google.com/go/storage"
	"github.com/eukarya-inc/reearth-plateauview/server/citygml"
	"github.com/klauspost/compress/gzip"
	"github.com/orisano/gosax/xmlb"
	"github.com/reearth/reearthx/log"
	"google.golang.org/api/googleapi"
)

func Run(conf Config) (err error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

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
	startedAt := time.Now().Format(time.RFC3339Nano)
	metadata := status(PackStatusProcessing)
	metadata["startedAt"] = startedAt
	{
		_, err = obj.If(storage.Conditions{GenerationMatch: attrs.Generation, MetagenerationMatch: attrs.Metageneration}).
			Update(ctx, storage.ObjectAttrsToUpdate{Metadata: metadata})

		if err != nil {
			var gErr *googleapi.Error
			if !(errors.As(err, &gErr) && gErr.Code == http.StatusPreconditionFailed) {
				log.Printf("SKIPPED: someone else is processing")
				return nil
			}
			return fmt.Errorf("update metadata: %v", err)
		}
	}

	w := obj.NewWriter(ctx)
	completedMetadata := status(PackStatusSucceeded)
	completedMetadata["startedAt"] = startedAt
	w.ObjectAttrs.Metadata = completedMetadata
	defer w.Close()

	p := &packer{
		w: w,
		p: progress{
			steps: int64(len(conf.URLs)) * 2,
		},
		httpClient: &http.Client{},
	}
	var finished bool
	var finishedMu sync.Mutex
	go func() {
		t := time.NewTicker(5 * time.Second)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				finishedMu.Lock()
				ok := finished
				if ok {
					finishedMu.Unlock()
					return
				}
				metadata["total"] = strconv.FormatInt(p.p.Total(), 64)
				metadata["processed"] = strconv.FormatInt(p.p.Processed(), 64)
				_, err := obj.Update(ctx, storage.ObjectAttrsToUpdate{
					Metadata: metadata,
				})
				finishedMu.Unlock()
				if err != nil {
					log.Printf("[WARN] failed to update progress: %s", err)
				}
			}
		}
	}()

	if err := p.pack(ctx, conf.Domain, conf.URLs); err != nil {
		return fmt.Errorf("pack: %w", err)
	}
	finishedMu.Lock()
	defer finishedMu.Unlock()
	if err := w.Close(); err != nil {
		return fmt.Errorf("close object writer: %v", err)
	}
	finished = true
	return nil
}

const (
	progressResolution = 10000
)

type progress struct {
	steps int64

	mu      sync.RWMutex
	s, n, c int64
}

func (p *progress) Total() int64 {
	return p.steps * progressResolution
}

func (p *progress) Processed() int64 {
	p.mu.RLock()
	defer p.mu.RUnlock()
	if p.n == 0 {
		return p.s * progressResolution
	} else {
		return p.s*progressResolution + int64(float64(p.c)/float64(p.n)*progressResolution)
	}
}

func (p *progress) gml(deps int64) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.s += 1
	p.n = deps
	p.c = 0
}

func (p *progress) depOne() {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.c += 1
}

func (p *progress) depEnd() {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.s += 1
	p.n = 0
	p.c = 0
}

type packer struct {
	w io.Writer
	p progress

	httpClient *http.Client
}

func (p *packer) pack(ctx context.Context, host string, gmlURLs []string) error {
	// gmlURLs をあらかじめパースして許可されていないホストがないことを確認する
	var q []string
	q = append(q, gmlURLs...)

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

			if host != "" && u.Host != host {
				return fmt.Errorf("invalid host: %s", u.Host)
			}

			nq, err = p.writeZip(ctx, t, zw, u, nq, seen)
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

func (p *packer) writeZip(ctx context.Context, t time.Time, zw *zip.Writer, u *url.URL, q []string, seen map[string]struct{}) ([]string, error) {
	depsMap := map[string]struct{}{}
	gml := strings.SplitN(u.Path, "/", 5)[4]
	root := path.Dir(gml)

	ze, err := zw.CreateHeader(&zip.FileHeader{
		Name:     gml,
		Method:   zip.Deflate,
		Modified: t,
	})
	if err != nil {
		return nil, fmt.Errorf("create: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("invalid url: %w", err)
	}
	req.Header.Set("Accept-Encoding", "gzip")

	resp, err := p.httpClient.Do(req)
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
		if err != nil {
			return nil, err
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
	p.p.gml(int64(len(deps)))
	defer p.p.depEnd()

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
				resp, err := p.httpClient.Do(d.req)
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
		p.p.depOne()
	}

	return q, nil
}

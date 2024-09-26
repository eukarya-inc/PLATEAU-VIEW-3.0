package main

import (
	"archive/zip"
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"sort"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/eukarya-inc/reearth-plateauview/server/citygml"
	"github.com/orisano/gosax"
	"github.com/reearth/reearthx/log"
	"google.golang.org/api/googleapi"
)

func main() {
	dest := flag.String("dest", "", "destination url (gs://...)")
	domain := flag.String("domain", "", "allowed domain")
	flag.Parse()
	req := citygml.PackAsyncRequest{
		Dest:   *dest,
		Domain: *domain,
		URLs:   flag.Args(),
	}
	if err := run(req); err != nil {
		log.Fatal(err)
	}
}

func run(req citygml.PackAsyncRequest) (err error) {
	ctx := context.Background()
	destURL, err := url.Parse(req.Dest)
	if err != nil {
		return fmt.Errorf("invalid destination bucket(%s): %w", req.Dest, err)
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
			Metadata: citygml.Status(citygml.PackStatusFailed),
		})
		if uErr != nil {
			log.Printf("failed to update status: (to=%s): %v", citygml.PackStatusFailed, uErr)
		}
	}()
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return fmt.Errorf("get metadata: %v", err)
	}
	if status := citygml.GetStatus(attrs.Metadata); status != citygml.PackStatusAccepted {
		log.Printf("SKIPPED: already exists (status=%s)", status)
		return nil
	}
	attrs, err = obj.If(storage.Conditions{GenerationMatch: attrs.Generation, MetagenerationMatch: attrs.Metageneration}).
		Update(ctx, storage.ObjectAttrsToUpdate{Metadata: citygml.Status(citygml.PackStatusProcessing)})
	if err != nil {
		var gErr *googleapi.Error
		if !(errors.As(err, &gErr) && gErr.Code == http.StatusPreconditionFailed) {
			log.Printf("SKIPPED: someone else is processing")
			return nil
		}
		return fmt.Errorf("update metadata: %v", err)
	}

	w := obj.NewWriter(ctx)
	w.ObjectAttrs.Metadata = citygml.Status(citygml.PackStatusSucceeded)
	defer w.Close()
	if err := pack(ctx, w, req.Domain, req.URLs); err != nil {
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
			nq, err = writeZip(ctx, zw, &httpClient, u, nq)
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

func writeZip(ctx context.Context, zw *zip.Writer, httpClient *http.Client, u *url.URL, q []string) ([]string, error) {
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
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request gml: %w", err)
	}
	defer resp.Body.Close()

	sax := gosax.NewReader(io.TeeReader(resp.Body, ze))
	sax.EmitSelfClosingTag = true
	inAppImageURI := false
	for {
		e, err := sax.Event()
		if err != nil {
			return nil, fmt.Errorf("event error: %w", err)
		}
		if e.Type() == gosax.EventEOF {
			break
		}
		switch e.Type() {
		case gosax.EventStart:
			t, err := gosax.StartElement(e.Bytes)
			if err != nil {
				return nil, fmt.Errorf("start element error: %w", err)
			}
			inAppImageURI = t.Name.Space == "app" && t.Name.Local == "imageURI"
			for _, a := range t.Attr {
				if a.Name.Space == "" && a.Name.Local == "codeSpace" {
					depsMap[a.Value] = struct{}{}
				}
				if a.Name.Space == "xsi" && a.Name.Local == "schemaLocation" {
					s := a.Value
					for s != "" {
						var u string
						u, s, _ = strings.Cut(s, " ")
						if u == "" {
							continue
						}
						if !(strings.HasPrefix(u, "http://") || strings.HasPrefix(u, "https://")) {
							depsMap[u] = struct{}{}
						}
					}
				}
			}
		case gosax.EventEnd:
			inAppImageURI = false
		case gosax.EventText:
			if inAppImageURI {
				depsMap[string(e.Bytes)] = struct{}{}
			}
		default:
		}
	}
	deps := make([]string, 0, len(depsMap))
	for dep := range depsMap {
		deps = append(deps, dep)
	}
	sort.Strings(deps)

	for _, dep := range deps {
		u := *u
		dir := path.Dir(u.Path)
		u.Path = path.Join(dir, dep)

		w, err := zw.Create(path.Join(root, dep))
		if err != nil {
			return nil, fmt.Errorf("create: %w", err)
		}
		req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
		if err != nil {
			return nil, fmt.Errorf("invalid url: %w", err)
		}
		resp, err := httpClient.Do(req)
		if err != nil {
			return nil, fmt.Errorf("request: %w", err)
		}
		_, err = io.Copy(w, resp.Body)
		_ = resp.Body.Close()
		if err != nil {
			return nil, fmt.Errorf("copy response: %w", err)
		}
	}
	return q, nil
}

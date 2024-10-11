package citygml

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"slices"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/cloudbuild/v1"
	"google.golang.org/api/googleapi"
)

type packer struct {
	conf   Config
	bucket *storage.BucketHandle
	build  *cloudbuild.Service
}

func newPacker(conf Config) *packer {
	ctx := context.Background()
	gcs, _ := storage.NewClient(ctx)
	bucket := gcs.Bucket(conf.Bucket)
	build, _ := cloudbuild.NewService(ctx)
	return &packer{
		conf:   conf,
		bucket: bucket,
		build:  build,
	}
}

func (p *packer) handleGetZip(c echo.Context, hash string) error {
	ctx := c.Request().Context()
	obj := p.bucket.Object(hash + ".zip")
	attrs, err := obj.Attrs(ctx)
	if errors.Is(err, storage.ErrObjectNotExist) {
		return c.NoContent(http.StatusNotFound)
	}
	if status := GetStatus(attrs.Metadata); status != PackStatusSucceeded {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"status": status,
			"reason": "invalid status",
		})
	}
	signedURL, err := p.bucket.SignedURL(obj.ObjectName(), &storage.SignedURLOptions{
		Method:  http.MethodGet,
		Expires: time.Now().Add(5 * time.Minute),
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error":  err.Error(),
			"reason": "failed to issue signed url",
		})
	}
	return c.Redirect(http.StatusFound, signedURL)
}

func (p *packer) handleGetStatus(c echo.Context, hash string) error {
	ctx := c.Request().Context()
	attrs, err := p.bucket.Object(hash + ".zip").Attrs(ctx)
	if errors.Is(err, storage.ErrObjectNotExist) {
		return c.NoContent(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, map[string]any{
		"status": GetStatus(attrs.Metadata),
	})
}

func (p *packer) handlePackRequest(c echo.Context) error {
	ctx := c.Request().Context()
	var req struct {
		URLs []string `json:"urls"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"reason": "invalid request body",
			"error":  err.Error(),
		})
	}
	if len(req.URLs) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"reason": "no urls provided",
		})
	}
	for _, citygmlURL := range req.URLs {
		u, err := url.Parse(citygmlURL)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":    citygmlURL,
				"reason": "invalid url",
			})
		}
		if p.conf.Domain != "" && u.Host != p.conf.Domain {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":    citygmlURL,
				"reason": "invalid domain",
			})
		}
	}
	slices.Sort(req.URLs)
	checksum := sha256.Sum256([]byte(strings.Join(req.URLs, ",")))
	hash := hex.EncodeToString(checksum[:])
	var resp struct {
		ID string `json:"id"`
	}
	resp.ID = hash

	obj := p.bucket.Object(hash + ".zip").If(storage.Conditions{DoesNotExist: true})
	w := obj.NewWriter(ctx)
	w.ObjectAttrs.Metadata = Status(PackStatusAccepted)
	_, _ = w.Write(nil)
	if err := w.Close(); err != nil {
		var gErr *googleapi.Error
		if !(errors.As(err, &gErr) && gErr.Code == http.StatusPreconditionFailed) {
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"reason": "failed to write metadata",
				"error":  err.Error(),
			})
		}
		return c.JSON(http.StatusOK, resp)
	}
	packReq := PackAsyncRequest{
		Dest:   toURL(obj),
		Domain: p.conf.Domain,
		URLs:   req.URLs,
	}
	if err := p.packAsync(ctx, packReq); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"reason": "failed to enqueue pack job",
			"error":  err.Error(),
		})
	}
	return c.JSON(http.StatusOK, resp)
}

func (p *packer) packAsync(ctx context.Context, req PackAsyncRequest) error {
	build := &cloudbuild.Build{
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{Name: p.conf.CityGMLPackerImage, Args: append([]string{"citygml-packer", "-dest", req.Dest, "-domain", req.Domain}, req.URLs...)},
		},
	}
	var err error
	if p.conf.WorkerRegion != "" {
		call := p.build.Projects.Locations.Builds.Create(path.Join("projects", p.conf.WorkerProject, "locations", p.conf.WorkerRegion), build)
		_, err = call.Do()
	} else {
		call := p.build.Projects.Builds.Create(p.conf.WorkerProject, build)
		_, err = call.Do()
	}
	if err != nil {
		return fmt.Errorf("create build: %w", err)
	}
	return nil
}

func Status(s string) map[string]string {
	return map[string]string{
		"status": s,
	}
}

func GetStatus(metadata map[string]string) string {
	return metadata["status"]
}

func toURL(obj *storage.ObjectHandle) string {
	return "gs://" + obj.BucketName() + "/" + obj.ObjectName()
}

type PackAsyncRequest struct {
	Dest   string   `json:"dest"`
	Domain string   `json:"domain"`
	URLs   []string `json:"urls"`
}

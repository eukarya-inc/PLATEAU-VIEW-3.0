package citygmlpacker

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

	"cloud.google.com/go/storage"
	"github.com/eukarya-inc/reearth-plateauview/server/citygml"
	"github.com/reearth/reearthx/log"
	"google.golang.org/api/googleapi"
)

func Run(conf Config) (err error) {
	ctx, cancel := context.WithTimeout(context.Background(), conf.Timeout)
	defer cancel()

	startedAt := time.Now().Format(time.RFC3339Nano)

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
		metadata := citygml.Status(PackStatusFailed)
		metadata["startedAt"] = startedAt
		_, uErr := obj.Update(ctx, storage.ObjectAttrsToUpdate{
			Metadata: metadata,
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

	p := NewPacker(w, len(conf.URLs), nil)

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

				progress := p.Progress()
				metadata["total"] = strconv.FormatInt(progress.Total(), 10)
				metadata["processed"] = strconv.FormatInt(progress.Processed(), 10)
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

	if err := p.Pack(ctx, conf.Domain, conf.URLs); err != nil {
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

package cmsintegrationv3

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/gcptaskrunner"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

const defaultTaskImage = "eukarya/plateauview2-sidecar-worker:latest"

var maxlodFeatures = []string{"dem"}

func handleMaxLOD(ctx context.Context, s *Services, w *cmswebhook.Payload) error {
	if s.TaskRunner == nil {
		return nil
	}

	// if event type is "item.create" and payload is metadata, skip it
	if w.Type == cmswebhook.EventItemCreate && w.ItemData.Item.OriginalItemID != nil ||
		w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
		return nil
	}

	found := false
	for _, f := range maxlodFeatures {
		if w.ItemData.Model.Key == cmsintegrationcommon.ModelPrefix+f {
			found = true
			break
		}
	}

	if !found {
		return nil
	}

	mainItem, err := s.GetMainItemWithMetadata(ctx, w.ItemData.Item)
	if err != nil {
		return fmt.Errorf("maxlod: failed to get main item: %w", err)
	}

	city := lo.FromPtr(mainItem.FieldByKey("city").GetValue().String())
	if city == "" {
		log.Debugfc(ctx, "cmsintegrationv3: maxlod: city not found")
		return nil
	}

	var asset string
	if w.Type == cmswebhook.EventItemCreate {
		asset = *mainItem.FieldByKey("citygml").GetValue().String()
	} else {
		asset = lo.FromPtr(getChangedString(w, "citygml"))
	}

	if asset == "" {
		log.Debugfc(ctx, "cmsintegrationv3: maxlod: citygml not updated")
		return nil
	}

	log.Debugfc(ctx, "cmsintegrationv3: maxlod: run")

	if err := s.TaskRunner.Run(ctx, gcptaskrunner.Task{
		Image: defaultTaskImage,
		Args: []string{
			"extract-maxlod",
			"--city=" + city,
			"--project=" + w.ProjectID(),
			"--ftypes=dem",
			"--overwrite",
			"--wetrun",
		},
	}, &gcptaskrunner.Config{
		Tags: []string{"maxlod"},
	}); err != nil {
		return fmt.Errorf("maxlod: failed to run task: %w", err)
	}

	if _, err := s.CMS.UpdateItem(ctx, mainItem.ID, nil, []*cms.Field{
		{
			ID:    "maxlod_status",
			Type:  "tag",
			Value: "実行中",
		},
	}); err != nil {
		log.Errorfc(ctx, "cmsintegrationv3: maxlod: failed to update item: %v", err)
	}

	_ = s.CMS.CommentToItem(ctx, mainItem.ID, "CityGMLが変更されたため最大LOD抽出を開始しました。")

	log.Debugfc(ctx, "cmsintegrationv3: maxlod: done")
	return nil
}

func getChangedString(w *cmswebhook.Payload, key string) *string {
	// w.ItemData.Item is a metadata item, so we need to use FieldByKey instead of MetadataFieldByKey
	if f := w.ItemData.Item.FieldByKey(key); f != nil {
		changed, ok := lo.Find(w.ItemData.Changes, func(c cms.FieldChange) bool {
			return c.ID == f.ID
		})

		if ok {
			b := changed.GetCurrentValue().String()
			if b != nil {
				return b
			}

			// workaround for string array
			if res := changed.GetCurrentValue().Strings(); len(res) > 0 {
				return lo.ToPtr(res[0])
			}
		}
	}

	return nil
}

package cmsintegrationflow

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

func sendRequestToFlow(ctx context.Context, s *Services, conf *Config, w *cmswebhook.Payload, featureType plateaucms.PlateauFeatureType) error {
	ctx = log.UpdateContext(ctx, func(l *log.Logger) *log.Logger {
		return l.AppendPrefixMessage("flow: ")
	})

	if !featureType.Conv && !featureType.QC {
		log.Debugfc(ctx, "skip qc and convert")
		return nil
	}

	mainItem, err := s.GetMainItemWithMetadata(ctx, w.ItemData.Item)
	if err != nil {
		return err
	}

	item := cmsintegrationcommon.FeatureItemFrom(mainItem)
	log.Debugfc(ctx, "item: %+v", item)

	if !item.UseFlow {
		log.Debugfc(ctx, "flow is disabled")
		return nil
	}

	if item.CityGML == "" || item.City == "" {
		log.Debugfc(ctx, "no city or no citygml")
		return nil
	}

	ty := ReqTypeFrom(item.IsQCAndConvSkipped(featureType.Code))
	if ty == "" {
		log.Debugfc(ctx, "skip qc and convert")
		return nil
	}

	// update convertion status
	if err := s.UpdateFeatureItemStatus(ctx, mainItem.ID, ty, cmsintegrationcommon.ConvertionStatusRunning); err != nil {
		return fmt.Errorf("failed to update item: %w", err)
	}

	// get CityGML asset
	cityGMLAsset, err := s.CMS.Asset(ctx, item.CityGML)
	if err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "CityGMLが見つかりません。")
		return fmt.Errorf("failed to get citygml asset: %w", err)
	}

	// get city item
	cityItemRaw, err := s.CMS.GetItem(ctx, item.City, false)
	if err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "都市アイテムが見つかりません。")
		return fmt.Errorf("failed to get city item: %w", err)
	}

	cityItem := cmsintegrationcommon.CityItemFrom(cityItemRaw)
	specv := cityItem.SpecMajorVersionInt()
	var triggerID string
	if ty.IsQC() {
		triggerID = featureType.FlowQCTriggerID(specv)
	} else if ty.IsConv() {
		triggerID = featureType.FlowConvTriggerID(specv)
	}
	if triggerID == "" {
		_ = s.Fail(ctx, mainItem.ID, ty, "v%dの%sのFlowトリガーIDが設定されていません。", specv, ty.Title())
		return fmt.Errorf("no trigger id for %s v%d", ty, specv)
	}

	// sign id
	sig := ID{
		ItemID:      mainItem.ID,
		ProjectID:   w.ProjectID(),
		FeatureType: featureType.Code,
	}.Sign(conf.Secret)

	// request to fme
	res, err := s.Flow.Request(ctx, FlowRequest{
		TriggerID:       triggerID,
		NotificationURL: resultURL(conf, sig),
		CityGMLURL:      cityGMLAsset.URL,
	})
	if err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "Flowへのリクエストに失敗しました。%v", err)
		return fmt.Errorf("failed to request to flow: %w", err)
	}

	log.Infofc(ctx, "success to trigger flow: %#v", res)

	// post a comment to the item
	err = s.CMS.CommentToItem(ctx, mainItem.ID, fmt.Sprintf("Flowでの%sを開始しました。", ty.Title()))
	if err != nil {
		return fmt.Errorf("failed to add comment: %w", err)
	}

	return nil
}

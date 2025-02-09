package cmsintegrationflow

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/k0kubun/pp/v3"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func sendRequestToFlow(
	ctx context.Context,
	s *Services,
	conf *Config,
	projectID string,
	modelName string,
	mainItem *cms.Item,
	featureTypes []plateaucms.PlateauFeatureType,
	overrideReqType ReqType,
) error {
	ctx = log.WithPrefixMessage(ctx, "flow: ")

	item := cmsintegrationcommon.FeatureItemFrom(mainItem)
	log.Debugfc(ctx, "item: %s", pp.Sprint(item))

	if item == nil {
		log.Debugfc(ctx, "no item")
		return nil
	}

	if item.CityGML == "" || item.City == "" {
		log.Debugfc(ctx, "no city or no citygml")
		return nil
	}

	featureTypeCode := item.FeatureTypeCode()
	featureType, ok := lo.Find(featureTypes, func(ft plateaucms.PlateauFeatureType) bool {
		return ft.Code == modelName || ft.Code == featureTypeCode
	})
	if !ok {
		log.Debugfc(ctx, "invalid feature type or model name: %s, %s", modelName, featureTypeCode)
		return nil
	}

	if !featureType.Conv && !featureType.QC {
		log.Debugfc(ctx, "skip qc and convert")
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
		_ = s.Fail(ctx, mainItem.ID, ty, "都市アイテムが正常に紐づけられていません。")
		return fmt.Errorf("failed to get city item: %w", err)
	}

	// trigger id
	cityItem := cmsintegrationcommon.CityItemFrom(cityItemRaw)
	specv := cityItem.SpecMajorVersionInt()
	var triggerID string
	if overrideReqType == ReqTypeQC || (overrideReqType == "" && ty.IsQC()) {
		triggerID = featureType.FlowQCTriggerID(specv)
	} else if overrideReqType == ReqTypeConv || (overrideReqType == "" && ty.IsConv()) {
		triggerID = featureType.FlowConvTriggerID(specv)
	}

	// conv settings
	convSettings := cityItem.ConvSettings().Merge(item.ConvSettings())
	if convSettings == nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "変換設定が見つかりません。都市アイテムの設定を確認してください。")
		return fmt.Errorf("no conv settings")
	}
	if convSettings.FeatureType == "" {
		convSettings.FeatureType = featureType.Code
	}

	dryrun := ""
	if triggerID == "" {
		dryrun = "（dryrun）"
	}

	// sign id
	sig := ID{
		ItemID:      mainItem.ID,
		ProjectID:   projectID,
		FeatureType: featureType.Code,
	}.Sign(conf.Secret)

	// request to flow
	res, err := s.Flow.Request(ctx, FlowRequest{
		TriggerID:       triggerID,
		NotificationURL: resultURL(conf, sig),
		AuthToken:       conf.FlowToken,
		CityGMLURL:      cityGMLAsset.URL,
		ConvSettings:    convSettings,
		DryRun:          dryrun != "",
	})
	if err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "Flowへのリクエストに失敗しました。%v", err)
		return fmt.Errorf("failed to request to flow: %w", err)
	}

	log.Infofc(ctx, "success to trigger flow: %#v", res)

	// post a comment to the item
	if err = s.CMS.CommentToItem(ctx, mainItem.ID, fmt.Sprintf("Flowでの%sを開始しました。%s", ty.Title(), dryrun)); err != nil {
		return fmt.Errorf("failed to add comment: %w", err)
	}

	return nil
}

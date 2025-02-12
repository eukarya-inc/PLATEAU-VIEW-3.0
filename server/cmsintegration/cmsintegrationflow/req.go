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
	featureTypes plateaucms.PlateauFeatureTypeList,
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

	featureTypeCodes := featureTypes.Codes()
	featureTypeCode := item.FeatureTypeCode()
	featureType, ok := lo.Find(featureTypes, func(ft plateaucms.PlateauFeatureType) bool {
		return ft.Code == modelName || ft.Code == featureTypeCode
	})
	if !ok {
		log.Debugfc(ctx, "invalid feature type or model name: %s, %s", modelName, featureTypeCode)
		return nil
	}

	log.Debugfc(ctx, "feature type: %s", pp.Sprint(featureType))
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
	cityItemRaw, err := s.CMS.GetItem(ctx, item.City, true)
	if err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "都市アイテムが正常に紐づけられていません。")
		return fmt.Errorf("failed to get city item: %w", err)
	}

	// trigger id
	cityItem := cmsintegrationcommon.CityItemFrom(cityItemRaw, featureTypeCodes)
	specv := cityItem.SpecMajorVersionInt()
	var triggerID string
	if overrideReqType == ReqTypeQC || (overrideReqType == "" && ty.IsQC()) {
		triggerID = featureType.FlowQCTriggerID(specv)
	} else if overrideReqType == ReqTypeConv || (overrideReqType == "" && ty.IsConv()) {
		triggerID = featureType.FlowConvTriggerID(specv)
	}
	if triggerID == "" {
		_ = s.Fail(ctx, mainItem.ID, ty, "Flowの%s（v%d）用トリガーIDが設定されていません。", ty.Title(), specv)
		return fmt.Errorf("failed to get trigger id: ty=%s, v=%d", ty, specv)
	}

	// conv settings
	convSettings := cityItem.ConvSettings().Merge(item.ConvSettings())
	if convSettings != nil && convSettings.FeatureType == "" {
		convSettings.FeatureType = featureType.Code
	}
	if err := convSettings.Validate(ty == ReqTypeQC); err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "%v", err)
		return fmt.Errorf("invalid conv settings: %w", err)
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
	})
	if err != nil {
		_ = s.Fail(ctx, mainItem.ID, ty, "Flowへのリクエストに失敗しました。%v", err)
		return fmt.Errorf("failed to request to flow: %w", err)
	}

	log.Infofc(ctx, "success to trigger flow: %#v", res)

	// post a comment to the item
	if err = s.CMS.CommentToItem(ctx, mainItem.ID, fmt.Sprintf("Flowでの%s（v%d）を開始しました。", ty.Title(), specv)); err != nil {
		return fmt.Errorf("failed to add comment: %w", err)
	}

	return nil
}

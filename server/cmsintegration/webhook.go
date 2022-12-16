package cmsintegration

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/fme"
	"github.com/reearth/reearthx/log"
)

func WebhookHandler(c Config) (cmswebhook.Handler, error) {
	s, err := NewServices(c)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()

		if w.Type != "item.update" && w.Type != "item.create" {
			log.Infof("webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.Data.Item.ModelID != c.CMSModelID {
			log.Infof("webhook: invalid model id: %s", w.Data.Item.ModelID)
			return nil
		}

		assetField := w.Data.Item.Field(c.CMSCityGMLFieldID)
		if assetField == nil || assetField.Value == nil {
			log.Infof("webhook: asset field not found: fieldId=%s", c.CMSCityGMLFieldID)
			return nil
		}
		if v, ok := assetField.Value.(string); !ok || v == "" {
			log.Infof("webhook: asset field empty: fieldId=%s", c.CMSCityGMLFieldID)
			return nil
		}

		bldgField := w.Data.Item.Field(c.CMSBldgFieldID)
		if bldgField != nil && bldgField.Value != nil {
			if s, ok := bldgField.Value.(string); ok && s != "" {
				log.Infof("webhook: 3dtiles already converted: field=%+v", bldgField)
				return nil
			}
		}

		assetID, ok := assetField.Value.(string)
		if !ok {
			log.Infof("webhook: invalid field value: %+v", assetField)
			return nil
		}

		asset, err := s.CMS.Asset(ctx, assetID)
		if err != nil || asset == nil || asset.ID == "" {
			log.Infof("webhook: cannot fetch asset: %w", err)
			return nil
		}

		fmeReq := fme.Request{
			ID: ID{
				ItemID:      w.Data.Item.ID,
				AssetID:     asset.ID,
				ProjectID:   w.Data.Schema.ProjectID,
				BldgFieldID: c.CMSBldgFieldID,
			}.String(c.Secret),
			Target: asset.URL,
			PRCS:   "6669", // TODO2: accept prcs code from webhook
		}

		if s.FME == nil {
			log.Infof("webhook: fme mocked: %+v", fmeReq)
		} else if err := s.FME.CheckQualityAndConvertAll(ctx, fmeReq); err != nil {
			log.Errorf("webhook: failed to request fme: %w", err)
			return nil
		}

		if err := s.CMS.Comment(ctx, asset.ID, "CityGMLの品質検査及び3D Tilesへの変換を開始しました。"); err != nil {
			log.Errorf("webhook: failed to comment: %w", err)
			return nil
		}

		log.Infof("webhook: done")

		return nil
	}, nil
}

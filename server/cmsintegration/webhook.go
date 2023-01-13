package cmsintegration

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/eukarya-inc/reearth-plateauview/server/fme"
	"github.com/reearth/reearthx/log"
)

const (
	modelKey = "plateau"
)

func WebhookHandler(c Config) (cmswebhook.Handler, error) {
	s, err := NewServices(c)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		if !w.Operator.IsUser() {
			log.Debugf("cmsintegration webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != "item.create" && w.Type != "item.update" {
			log.Debugf("cmsintegration webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.Data.Item == nil || w.Data.Model == nil {
			log.Debugf("cmsintegration webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.Data.Model.Key != modelKey {
			log.Debugf("cmsintegration webhook: invalid model id: %s, key: %s", w.Data.Item.ModelID, w.Data.Model.Key)
			return nil
		}

		ctx := req.Context()
		item := ItemFrom(*w.Data.Item)

		if !item.ConversionEnabled.Enabled() {
			log.Infof("cmsintegration webhook: convertion disabled: %+v", item)
			return nil
		}

		if item.ConversionStatus == StatusOK {
			log.Infof("cmsintegration webhook: convertion already done: %+v", item)
			return nil
		}

		if item.ConversionStatus == StatusProcessing {
			log.Infof("cmsintegration webhook: convertion processing: %+v", item)
			return nil
		}

		if item.CityGML == "" {
			log.Infof("cmsintegration webhook: invalid field value: %+v", item)
			return nil
		}

		asset, err := s.CMS.Asset(ctx, item.CityGML)
		if err != nil || asset == nil || asset.ID == "" {
			log.Infof("cmsintegration webhook: cannot fetch asset: %w", err)
			return nil
		}

		fmeReq := fme.ConversionRequest{
			ID: fme.ID{
				ItemID:    w.Data.Item.ID,
				AssetID:   asset.ID,
				ProjectID: w.Data.Schema.ProjectID,
			}.String(c.Secret),
			Target:             asset.URL,
			PRCS:               item.PRCS.ESPGCode(),
			DevideODC:          item.DevideODC.Enabled(),
			QualityCheckParams: item.QualityCheckParams,
			QualityCheck:       !c.FMESkipQualityCheck,
		}

		if s.FME == nil {
			log.Infof("webhook: fme mocked: %+v", fmeReq)
		} else if err := s.FME.Request(ctx, fmeReq); err != nil {
			log.Errorf("cmsintegration webhook: failed to request fme: %s", err)
			return nil
		}

		if _, err := s.CMS.UpdateItem(ctx, item.ID, Item{
			ConversionStatus: StatusProcessing,
		}.Fields()); err != nil {
			log.Errorf("cmsintegration webhook: failed to update item: %w", err)
			return nil
		}

		if err := s.CMS.CommentToItem(ctx, item.ID, "CityGMLの品質検査及び3D Tilesへの変換を開始しました。"); err != nil {
			log.Errorf("cmsintegration webhook: failed to comment: %s", err)
			return nil
		}

		log.Infof("cmsintegration webhook: done")

		return nil
	}, nil
}

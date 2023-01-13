package sdk

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/eukarya-inc/reearth-plateauview/server/fme"
	"github.com/reearth/reearthx/log"
)

var (
	modelKey = "plateau"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		if !w.Operator.IsUser() {
			log.Debugf("sdk webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != "item.create" && w.Type != "item.update" {
			log.Debugf("sdk webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.Data.Item == nil || w.Data.Model == nil {
			log.Debugf("sdk webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.Data.Model.Key != modelKey {
			log.Debugf("sdk webhook: invalid model id: %s, key: %s", w.Data.Item.ModelID, w.Data.Model.Key)
			return nil
		}

		item := ItemFrom(*w.Data.Item)
		log.Infof("sdk webhook: item: %+v", item)

		if item.MaxLODStatus != "" && item.MaxLODStatus != StatusReady {
			log.Infof("sdk webhook: skipped: %s", item.MaxLODStatus)
			return nil
		}

		if item.CityGML == "" {
			log.Infof("sdk webhook: skipped: no citygml")
			return nil
		}

		ctx := req.Context()
		citygml, err := s.CMS.Asset(ctx, item.CityGML)
		if err != nil {
			log.Errorf("sdk webhook: failed to get citygml asset: %s", err)
			return nil
		}

		if err := s.FME.Request(ctx, fme.MaxLODRequest{
			ID: fme.ID{
				ItemID:    item.ID,
				AssetID:   citygml.ID,
				ProjectID: w.Data.Schema.ProjectID,
			}.String(conf.Secret),
			Target: citygml.URL,
		}); err != nil {
			log.Errorf("sdk webhook: failed to send request to FME: %s", err)
			return nil
		}

		if _, err := s.CMS.UpdateItem(ctx, item.ID, Item{
			MaxLODStatus: StatusProcessing,
		}.Fields()); err != nil {
			log.Errorf("sdk webhook: failed to update item: %w", err)
		}

		log.Infof("sdk webhook: done")
		return nil
	}, nil
}

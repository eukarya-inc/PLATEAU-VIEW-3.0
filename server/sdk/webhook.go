package sdk

import (
	"net/http"

	"github.com/reearth/reearth-cms-api/go/cmswebhook"
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
		if !w.Operator.IsUser() && w.Operator.IsIntegrationBy(conf.CMSIntegration) {
			log.Debugf("sdk webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate {
			log.Debugf("sdk webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
			log.Debugf("sdk webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.ItemData.Model.Key != modelKey {
			log.Debugf("sdk webhook: invalid model id: %s, key: %s", w.ItemData.Item.ModelID, w.ItemData.Model.Key)
			return nil
		}

		item := ItemFrom(*w.ItemData.Item)
		item.ProjectID = w.ItemData.Schema.ProjectID

		s.RequestMaxLODExtraction(req.Context(), item, item.ProjectID, false)

		log.Infof("sdk webhook: done")
		return nil
	}, nil
}

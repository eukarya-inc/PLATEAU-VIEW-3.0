package geospatialjp

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/reearth/reearthx/log"
)

var (
	modelKey = "plateau"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	// c, err := NewServices(conf)
	// if err != nil {
	// 	return nil, err
	// }

	return func(req *http.Request, w *cmswebhook.Payload) error {
		if !w.Operator.IsUser() {
			log.Debugf("geospatialjp webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != "item.update" && w.Type != "item.publish" {
			log.Debugf("geospatialjp webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.Data.Item == nil || w.Data.Model == nil {
			log.Debugf("geospatialjp webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.Data.Model.Key != modelKey {
			log.Debugf("geospatialjp webhook: invalid model id: %s, key: %s", w.Data.Item.ModelID, w.Data.Model.Key)
			return nil
		}

		// ctx := req.Context()
		// item := ItemFrom(w.Data.Item)

		// TODO
		return nil
	}, nil
}

package geospatialjp

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/reearth/reearthx/log"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	// c, err := NewServices(conf)
	// if err != nil {
	// 	return nil, err
	// }

	return func(req *http.Request, w *cmswebhook.Payload) error {
		if !w.Operator.IsUser() {
			log.Infof("geospatialjp webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		// TODO
		return nil
	}, nil
}

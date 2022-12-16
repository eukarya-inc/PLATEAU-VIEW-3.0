package geospatialjp

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	// c, err := NewServices(conf)
	// if err != nil {
	// 	return nil, err
	// }

	return func(req *http.Request, w *cmswebhook.Payload) error {
		// TODO
		return nil
	}, nil
}

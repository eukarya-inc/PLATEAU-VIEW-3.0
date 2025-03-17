package cmsintegrationv3

import (
	"net/http"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()
		ctx = log.WithPrefixMessage(ctx, "cmsintegrationv3 webhook: ")

		log.Debugfc(ctx, "incoming: %+v", w)

		if !cmsintegrationcommon.ValidatePayload(ctx, w, conf.CMSIntegration) {
			return nil
		}

		modelName := strings.TrimPrefix(w.ItemData.Model.Key, cmsintegrationcommon.ModelPrefix)

		err := sendRequestToFME(ctx, s, &conf, w)
		if err != nil {
			log.Errorfc(ctx, "failed to process event: %v", err)
		}

		log.Debugfc(ctx, "done: %s", modelName)
		return nil
	}, nil
}
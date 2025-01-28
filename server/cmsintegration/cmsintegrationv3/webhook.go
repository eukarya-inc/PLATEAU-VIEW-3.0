package cmsintegrationv3

import (
	"net/http"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
	"golang.org/x/exp/slices"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()
		ctx = log.UpdateContext(ctx, func(l *log.Logger) *log.Logger {
			return l.AppendPrefixMessage("cmsintegrationv3 webhook: ")
		})

		log.Debugfc(ctx, "incoming: %+v", w)

		if !w.Operator.IsUser() && w.Operator.IsIntegrationBy(conf.CMSIntegration) {
			log.Debugfc(ctx, "invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate {
			log.Debugfc(ctx, "invalid event type: %s", w.Type)
			return nil
		}

		if w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
			log.Debugfc(ctx, "invalid event data: %+v", w.Data)
			return nil
		}

		if !strings.HasPrefix(w.ItemData.Model.Key, cmsintegrationcommon.ModelPrefix) {
			log.Debugfc(ctx, "invalid model id: %s, key: %s", w.ItemData.Item.ModelID, w.ItemData.Model.Key)
			return nil
		}

		modelName := strings.TrimPrefix(w.ItemData.Model.Key, cmsintegrationcommon.ModelPrefix)
		var err error

		if modelName == cmsintegrationcommon.RelatedModel {
			err = handleRelatedDataset(ctx, s, w)
		} else if modelName == cmsintegrationcommon.SampleModel || slices.Contains(cmsintegrationcommon.FeatureTypes, modelName) {
			err = sendRequestToFME(ctx, s, &conf, w)
			if err == nil {
				err = handleMaxLOD(ctx, s, w)
			}
		}

		if err != nil {
			log.Errorfc(ctx, "failed to process event: %v", err)
		}

		log.Debugfc(ctx, "done: %s", modelName)
		return nil
	}, nil
}

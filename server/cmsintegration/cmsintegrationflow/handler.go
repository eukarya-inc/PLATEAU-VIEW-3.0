package cmsintegrationflow

import (
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

const handlerPath = "/notify_flow"

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()
		ctx = log.WithPrefixMessage(ctx, "cmsintegrationflow webhook: ")

		log.Debugfc(ctx, "incoming: %+v", w)
		if !cmsintegrationcommon.ValidatePayload(ctx, w, conf.CMSIntegration) {
			return nil
		}

		// if event type is "item.create" and payload is metadata, skip it
		if w.Type == cmswebhook.EventItemCreate && (w.ItemData.Item.OriginalItemID != nil || w.ItemData.Item.IsMetadata) {
			log.Debugfc(ctx, "skip")
			return nil
		}

		modelName := strings.TrimPrefix(w.ItemData.Model.Key, cmsintegrationcommon.ModelPrefix)
		if modelName != "flow" { // only trigger flow for flow model
			log.Debugfc(ctx, "skip model: %s", modelName)
			return nil
		}

		mainItem, err := s.GetMainItemWithMetadata(ctx, w.ItemData.Item)
		if err != nil {
			return err
		}

		featureTypes, err := s.PCMS.PlateauFeatureTypes(ctx)
		if err != nil {
			log.Errorfc(ctx, "failed to get feature types: %v", err)
			return nil
		}

		if err := sendRequestToFlow(ctx, s, &conf, w.ProjectID(), modelName, mainItem, featureTypes, ""); err != nil {
			log.Errorfc(ctx, "failed to trigger flow: %v", err)
			return nil
		}

		log.Debugfc(ctx, "done")
		return nil
	}, nil
}

func Handler(conf Config, g *echo.Group) error {
	s, err := NewServices(conf)
	if err != nil {
		return err
	}

	g.POST(path.Join(handlerPath, ":id"), func(c echo.Context) error {
		ctx := c.Request().Context()
		ctx = log.WithPrefixMessage(ctx, "cmsintegrationflow notify: ")
		id := c.Param("id")
		if id == "" {
			log.Infofc(ctx, "empty id")
			return c.JSON(http.StatusBadRequest, "empty id")
		}

		var f FlowResult
		if err := c.Bind(&f); err != nil {
			log.Infofc(ctx, "invalid payload: %w", err)
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		f.ID = id
		log.Infofc(ctx, "received: %#v", f)

		if err := receiveResultFromFlow(ctx, s, &conf, f); err != nil {
			log.Errorfc(ctx, "failed to receive result from fme: %v", err)
			return c.JSON(http.StatusInternalServerError, "failed to receive result from fme")
		}

		return nil
	})

	return nil
}

func resultURL(conf *Config, sig string) string {
	u, _ := url.JoinPath(conf.Host, handlerPath, sig)
	return u
}

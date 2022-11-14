package cmsintegration

import (
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/fme"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/webhook"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func WebhookHandler(f fme.Interface, cms cms.Interface, modelID, cityGMLFieldID, bldgFieldID, secret string) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		w := webhook.GetPayload(ctx)
		if w == nil {
			return c.JSON(http.StatusUnauthorized, "unauthorized")
		}

		if err := c.JSON(http.StatusOK, "ok"); err != nil {
			return err
		}

		if w.Type != "item.update" && w.Type != "item.create" {
			log.Infof("webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.Data.Item.ModelID != modelID {
			log.Infof("webhook: invalid model id: %s", w.Data.Item.ModelID)
			return nil
		}

		assetField := w.Data.Item.Field(cityGMLFieldID)
		if assetField == nil {
			log.Infof("webhook: field not found: fieldId=%s", cityGMLFieldID)
			return nil
		}

		assetID, ok := assetField.Value.(string)
		if !ok {
			log.Infof("webhook: invalid field value: %+v", assetField)
			return nil
		}

		asset, err := cms.Asset(ctx, assetID)
		if err != nil || asset == nil || asset.ID == "" {
			log.Infof("webhook: cannot fetch asset: %w", err)
			return nil
		}

		req := fme.Request{
			ID: ID{
				ItemID:       w.Data.Item.ID,
				AssetID:      asset.ID,
				TilesFieldID: bldgFieldID,
			}.String(secret),
			Target: asset.URL,
			PRCS:   "6669", // TODO2: accept prcs code from webhook
		}

		if f == nil {
			log.Infof("webhook: fme mocked: %+v", req)
		} else if err := f.CheckQualityAndConvertAll(ctx, req); err != nil {
			log.Errorf("webhook: failed to request fme: %w", err)
			return nil
		}

		if err := cms.Comment(ctx, asset.ID, "CityGMLの品質検査及び3D Tilesへの変換を開始しました。"); err != nil {
			log.Errorf("webhook: failed to comment: %w", err)
			return nil
		}

		return nil
	}
}

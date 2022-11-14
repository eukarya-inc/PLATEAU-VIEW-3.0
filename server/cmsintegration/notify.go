package cmsintegration

import (
	"fmt"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cms"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func NotifyHandler(cms cms.Interface, secret string) echo.HandlerFunc {
	return func(c echo.Context) error {
		var b fmeResult
		if err := c.Bind(b); err != nil {
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		log.Infof("notify: received: %+v", b)

		if b.Type != "ok" && b.Type != "error" {
			return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid type: %s", b.Type))
		}

		id, err := ParseID(b.ID, secret)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, "unauthorized")
		}

		log.Errorf("notify: validate: itemID=%s, assetID=%s", id.ItemID, id.AssetID)

		if err := c.JSON(http.StatusOK, "ok"); err != nil {
			return err
		}

		cc := commentContent(b.Status, b.Type, b.LogURL)
		if err := cms.Comment(c.Request().Context(), id.AssetID, cc); err != nil {
			log.Errorf("notify: failed to comment: %w", err)
			return nil
		}

		if b.Type == "error" {
			return nil
		}

		// TODO2: support multiple files
		// TODO2: add retry
		bldg := b.GetResultFromAllLOD("bldg")
		if bldg == "" {
			log.Errorf("notify: not uploaded due to missing result bldg")
			return nil
		}

		assetID, err := cms.UploadAsset(c.Request().Context(), bldg)
		if err != nil {
			log.Errorf("notify: failed to upload asset: %w", err)
			return nil
		}

		fields := map[string]any{
			"fields": []map[string]any{
				{
					"id":    id.TilesFieldID,
					"type":  "asset",
					"value": assetID,
				},
			},
		}

		if err := cms.UpdateItem(c.Request().Context(), id.ItemID, fields); err != nil {
			log.Errorf("notify: failed to update item: %w", err)
			return nil
		}

		return nil
	}
}

func commentContent(s string, t string, logURL string) string {
	var log string
	if logURL != "" {
		log = fmt.Sprintf(" ログ: %s", logURL)
	}

	var tt string
	if t == "qualityCheck" {
		tt = "品質検査"
	} else if t == "convert" {
		tt = "3D Tiles への変換"
	}

	if s == "ok" {
		return fmt.Sprintf("%sに成功しました。%s", tt, log)
	}

	return fmt.Sprintf("%sでエラーが発生しました。%s", tt, log)
}

package cmsintegration

import (
	"fmt"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cms"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func NotifyHandler(cmsi cms.Interface, secret string) echo.HandlerFunc {
	return func(c echo.Context) error {
		var b fmeResult
		if err := c.Bind(&b); err != nil {
			log.Info("notify: invalid payload: %w", err)
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		log.Infof("notify: received: %+v", b)

		id, err := ParseID(b.ID, secret)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, "unauthorized")
		}

		log.Errorf("notify: validate: itemID=%s, assetID=%s", id.ItemID, id.AssetID)

		if b.Status != "ok" && b.Status != "error" {
			return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid type: %s", b.Type))
		}

		if err := c.JSON(http.StatusOK, "ok"); err != nil {
			return err
		}

		cc := commentContent(b.Status, b.Type, b.LogURL)
		if err := cmsi.Comment(c.Request().Context(), id.AssetID, cc); err != nil {
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

		assetID, err := cmsi.UploadAsset(c.Request().Context(), id.ProjectID, bldg)
		if err != nil {
			log.Errorf("notify: failed to upload asset: %w", err)
			return nil
		}

		log.Infof("notify: asset uploaded: %s", assetID)

		if err := cmsi.UpdateItem(c.Request().Context(), id.ItemID, []cms.Field{
			{
				ID:    id.BldgFieldID,
				Type:  "asset",
				Value: assetID,
			},
		}); err != nil {
			log.Errorf("notify: failed to update item: %w", err)
			return nil
		}

		log.Infof("notify: done")

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
	} else if t == "conversion" {
		tt = "3D Tiles への変換"
	}

	if s == "ok" {
		return fmt.Sprintf("%sに成功しました。%s", tt, log)
	}

	return fmt.Sprintf("%sでエラーが発生しました。%s", tt, log)
}

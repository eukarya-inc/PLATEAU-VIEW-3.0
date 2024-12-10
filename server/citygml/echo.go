package citygml

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func Echo(conf PackerConfig, g *echo.Group) error {
	p := newPacker(conf)

	// すでに存在したらダウンロードできるエンドポイント
	// URL Redirect で GCS から直接ダウンロードをできるようにする
	// => pre-signed url に redirect する形
	g.GET("/pack/:id.zip", func(c echo.Context) error {
		idZip := c.Param("id.zip")
		const suffix = ".zip"
		if !strings.HasSuffix(idZip, suffix) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
		}
		return p.handleGetZip(c, strings.TrimSuffix(idZip, suffix))
	})

	// 存在する場合は状態を返す: accepted, processing, succeeded, failed
	// 存在しない場合は 404 を返す
	g.GET("/pack/:id/status", func(c echo.Context) error {
		return p.handleGetStatus(c, c.Param("id"))
	})

	// URLを複数指定したら必要ファイルのみが含まれた zip ファイルを非同期で作成するエンドポイント
	// id を返す
	g.POST("/pack", p.handlePackRequest)

	g.GET("/attributes", func(c echo.Context) error {
		citygmlURL := c.QueryParam("url")
		u, err := url.Parse(citygmlURL)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":    citygmlURL,
				"reason": "invalid url",
			})
		}
		if p.conf.Domain != "" && u.Host != p.conf.Domain {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":    citygmlURL,
				"reason": "invalid domain",
			})
		}
		ids := strings.Split(c.QueryParam("id"), ",")
		if len(ids) == 0 || (len(ids) == 1 && ids[0] == "") {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"reason": "id parameter is required",
			})
		}
		resp, err := Attributes(http.DefaultClient, citygmlURL, ids)
		if err != nil {
			log.Errorfc(c.Request().Context(), "citygml: failed to extract attributes: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "internal",
			})
		}
		return c.JSON(http.StatusOK, resp)
	})

	return nil
}

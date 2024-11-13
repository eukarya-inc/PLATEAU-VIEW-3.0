package citygml

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
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
			return c.NoContent(http.StatusBadRequest)
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
	return nil
}

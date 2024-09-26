package citygml

import (
	"github.com/labstack/echo/v4"
)

type Config struct {
	Domain             string `json:"domain"`
	Bucket             string `json:"bucket"`
	CityGMLPackerImage string `json:"cityGMLPackerImage"`
	WorkerRegion       string `json:"workerRegion"`
	WorkerProject      string `json:"workerProject"`
}

const (
	PackStatusAccepted   = "accepted"
	PackStatusProcessing = "processing"
	PackStatusSucceeded  = "succeeded"
	PackStatusFailed     = "failed"
)

func Echo(conf Config, g *echo.Group) error {
	p := newPacker(conf)

	// すでに存在したらダウンロードできるエンドポイント
	// URL Redirect で GCS から直接ダウンロードをできるようにする
	// => pre-signed url に redirect する形
	g.GET("/pack/{id}.zip", func(c echo.Context) error {
		return p.handleGetZip(c, c.Param("id"))
	})
	// 存在する場合は状態を返す: accepted, processing, succeeded, failed
	// 存在しない場合は 404 を返す
	g.GET("/pack/{id}/status", func(c echo.Context) error {
		return p.handleGetStatus(c, c.Param("id"))
	})
	// URLを複数指定したら必要ファイルのみが含まれた zip ファイルを非同期で作成するエンドポイント
	// id を返す
	g.POST("/pack", p.handlePackRequest)
	return nil
}

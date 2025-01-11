package citygml

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

type Config struct {
	Domain             string `json:"domain"`
	Bucket             string `json:"bucket"`
	CityGMLPackerImage string `json:"cityGMLPackerImage"`
	WorkerRegion       string `json:"workerRegion"`
	WorkerProject      string `json:"workerProject"`
}

var httpClient = &http.Client{
	Timeout: 30 * time.Second,
}

func Echo(conf Config, g *echo.Group) error {
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

	g.GET("/attributes", attributeHandler(p.conf.Domain))
	g.GET("/features", featureHandler(p.conf.Domain))

	g.GET("/spatialid_attributes", spatialIDAttributesHandler())

	return nil
}

func attributeHandler(domain string) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		citygmlURL := c.QueryParam("url")
		u, err := url.Parse(citygmlURL)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":   citygmlURL,
				"error": "invalid url",
			})
		}

		if domain != "" && u.Host != domain {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":   citygmlURL,
				"error": "invalid domain",
			})
		}

		ids := strings.Split(c.QueryParam("id"), ",")
		if len(ids) == 0 || (len(ids) == 1 && ids[0] == "") {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"error": "id parameter is required",
			})
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, citygmlURL, nil)
		if err != nil {
			log.Errorfc(ctx, "citygml: failed to create request: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "internal",
			})
		}

		resp, err := httpClient.Do(req)
		if err != nil {
			log.Errorfc(c.Request().Context(), "citygml: failed to fetch: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "cannot fetch",
			})
		}

		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":   citygmlURL,
				"error": "cannot fetch",
			})
		}

		attrs, err := Attributes(resp.Body, ids)
		if err != nil {
			log.Errorfc(ctx, "citygml: failed to extract attributes: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "internal",
			})
		}

		return c.JSON(http.StatusOK, attrs)
	}
}

func spatialIDAttributesHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		// ctx := c.Request().Context()
		sids := strings.Split(c.QueryParam("sid"), ",")
		types := strings.Split(c.QueryParam("type"), ",")
		if len(sids) == 0 || (len(sids) == 1 && sids[0] == "") {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"error": "sid parameter is required",
			})
		}
		if len(types) == 0 || (len(types) == 1 && types[0] == "") {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"error": "type parameter is required",
			})
		}

		// dummy
		return c.JSON(http.StatusOK, []map[string]any{
			{
				"gml:id":       "dummy1",
				"feature_type": "dummy",
				"gen:genericAttribute": []map[string]any{
					{
						"name":  "dummy",
						"type":  "string",
						"value": "DUMMY",
					},
				},
			},
			{
				"gml:id":       "dummy2",
				"feature_type": "dummy",
				"gen:genericAttribute": []map[string]any{
					{
						"name":  "dummy",
						"type":  "string",
						"value": "DUMMY",
					},
				},
			},
		})
	}
}

func featureHandler(domain string) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		citygmlURL := c.QueryParam("url")
		u, err := url.Parse(citygmlURL)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":   citygmlURL,
				"error": "invalid url",
			})
		}

		if domain != "" && u.Host != domain {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":   citygmlURL,
				"error": "invalid domain",
			})
		}

		ids := strings.Split(c.QueryParam("sid"), ",")
		if len(ids) == 0 || (len(ids) == 1 && ids[0] == "") {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"error": "sid parameter is required",
			})
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, citygmlURL, nil)
		if err != nil {
			log.Errorfc(ctx, "citygml: failed to create request: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "internal",
			})
		}

		resp, err := httpClient.Do(req)
		if err != nil {
			log.Errorfc(c.Request().Context(), "citygml: failed to fetch: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "cannot fetch",
			})
		}

		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"url":   citygmlURL,
				"error": "cannot fetch",
			})
		}

		features, err := Features(resp.Body, ids)
		if err != nil {
			log.Errorfc(ctx, "citygml: failed to get features: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"url":   citygmlURL,
				"error": "internal",
			})
		}

		return c.JSON(http.StatusOK, map[string]any{
			"featureIds": features,
		})
	}
}

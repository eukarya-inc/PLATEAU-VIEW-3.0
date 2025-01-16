package citygml

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/reearth-plateauview/server/geo"
	"github.com/eukarya-inc/reearth-plateauview/server/geo/jisx0410"
	"github.com/eukarya-inc/reearth-plateauview/server/geo/spatialid"
	"github.com/eukarya-inc/reearth-plateauview/server/govpolygon"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

type Config struct {
	plateaucms.Config
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

	repo, err := datacatalog.NewRepo(datacatalog.Config{
		Config: conf.Config,
	})
	if err != nil {
		return err
	}

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

	papi, err := repo.PlateauAPI()
	if err != nil {
		return err
	}

	g.GET("/spatialid_attributes", spatialIDAttributesHandler(papi, repo.Govpolygon()))

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
		skipCodeListFetch := c.QueryParam("skip_code_list_fetch") != ""

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

		var resolver codeResolver
		if !skipCodeListFetch {
			resolver = &fetchCodeResolver{
				client: httpClient,
				url:    citygmlURL,
			}
		}

		attrs, err := Attributes(resp.Body, ids, resolver)
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

func spatialIDAttributesHandler(papi plateauapi.Repo, qt *govpolygon.Quadtree) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
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

		var cityIDs []string
		var bounds []geo.Bounds2
		for _, sid := range sids {
			b3, err := spatialid.Bounds(sid)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]any{
					"error": "invalid sid",
					"sid":   sid,
				})
			}
			b := b3.ToXY()
			bounds = append(bounds, b)
			cityIDs = append(cityIDs, qt.FindRect(b.QBounds())...)
		}
		var rs []Reader
		for _, cityID := range lo.Uniq(cityIDs) {
			resp, err := datacatalog.FetchCityGMLFiles(ctx, papi, cityID)
			if err != nil {
				log.Errorfc(ctx, "citygml: failed to fetch citygml files: %v", err)
				return c.JSON(http.StatusInternalServerError, map[string]any{
					"error": "internal",
				})
			}
			if resp == nil {
				continue
			}
			for _, t := range types {
				for _, f := range resp.Files[t] {
					m, _ := jisx0410.Parse(f.MeshCode)
					for _, b := range bounds {
						if m.Bounds.IsIntersect(b) {
							rs = append(rs, &urlReader{URL: f.URL, client: httpClient})
							break
						}
					}
				}
			}
		}
		attributes, err := SpatialIDAttributes(rs, sids)
		if err != nil {
			log.Errorfc(ctx, "citygml: failed to extract attributes: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"error": "internal",
			})
		}
		if attributes == nil {
			attributes = []map[string]any{}
		}
		return c.JSON(http.StatusOK, attributes)
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
		if features == nil {
			features = []string{}
		}
		return c.JSON(http.StatusOK, map[string]any{
			"featureIds": features,
		})
	}
}

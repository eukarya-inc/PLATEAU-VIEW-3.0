package sdkapi

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/labstack/echo/v4"
)

func Handler(conf Config, g *echo.Group) error {
	conf.Default()

	icl, err := cms.New(conf.CMSBaseURL, conf.CMSToken)
	if err != nil {
		return err
	}

	// cl, err := cms.NewPublicAPIClient[Item](nil, conf.CMSBaseURL, conf.Project)
	// if err != nil {
	// 	return err
	// }

	cms := NewCMS(icl, nil, conf.Project, false)
	return handler(conf, g, cms)
}

func handler(conf Config, g *echo.Group, cms *CMS) error {
	conf.Default()

	c := putil.NewCacheMiddleware(putil.CacheConfig{
		Disabled: conf.DisableCache,
		TTL:      time.Duration(conf.CacheTTL) * time.Second,
	})

	g.GET("/datasets", func(c echo.Context) error {
		data, err := cms.Datasets(c.Request().Context(), conf.Model)
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, data)
	}, auth(conf.Token), c.Middleware())

	g.GET("/datasets/:id/files", func(c echo.Context) error {
		data, err := cms.Files(c.Request().Context(), conf.Model, c.Param("id"))
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, data)
	}, auth(conf.Token))

	return nil
}

func auth(expected string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if expected != "" {
				token := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
				if token != expected {
					return echo.ErrUnauthorized
				}
			}

			return next(c)
		}
	}
}

func getMaxLOD(ctx context.Context, u string) (MaxLODColumns, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid status code: %d", res.StatusCode)
	}

	r := csv.NewReader(res.Body)
	r.ReuseRecord = true
	var results MaxLODColumns
	for {
		c, err := r.Read()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, fmt.Errorf("failed to read csv: %w", err)
		}

		if len(c) != 3 || !isInt(c[0]) {
			continue
		}

		m, err := strconv.ParseFloat(c[2], 64)
		if err != nil {
			continue
		}

		results = append(results, MaxLODColumn{
			Code:   c[0],
			Type:   c[1],
			MaxLOD: m,
		})
	}

	return results, nil
}

func isInt(s string) bool {
	for _, c := range s {
		if !unicode.IsDigit(c) {
			return false
		}
	}
	return true
}

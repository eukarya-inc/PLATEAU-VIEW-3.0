package sdkapi

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"
	"unicode"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func Handler(conf Config, g *echo.Group) {
	conf.Normalize()
	cl := cms.NewPublicAPIClient[Item](nil, conf.CMSBaseURL, conf.Project)

	g.GET("/datasets", func(c echo.Context) error {
		data, err := Datasets(c.Request().Context(), cl, conf.Model)
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, data)
	}, auth(conf.Token))

	g.GET("/datasets/:id/files", func(c echo.Context) error {
		data, err := Files(c.Request().Context(), cl, conf.Model, c.Param("id"))
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, data)
	}, auth(conf.Token))
}

func Datasets(ctx context.Context, c *cms.PublicAPIClient[Item], model string) (*DatasetResponse, error) {
	items, err := c.GetItems(ctx, model)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	return Items(items).DatasetResponse(), nil
}

func Files(ctx context.Context, c *cms.PublicAPIClient[Item], model, id string) (any, error) {
	item, err := c.GetItem(ctx, model, id)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	if item.CityGML == nil || item.MaxLOD == nil {
		return nil, rerror.ErrNotFound
	}

	asset, err := c.GetAsset(ctx, item.CityGML.ID)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	maxlod, err := getMaxLOD(ctx, item.MaxLOD.URL)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	files := lo.FilterMap(asset.Files, func(u string, _ int) (*url.URL, bool) {
		res, err := url.Parse(u)
		return res, err == nil && path.Ext(res.Path) == ".gml"
	})

	return maxlod.Map().Files(files), nil
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

		results = append(results, MaxLODColumn{
			Code:   c[0],
			Type:   c[1],
			MaxLOD: c[2],
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

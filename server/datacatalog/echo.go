package datacatalog

import (
	"net/http"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

func Echo(conf Config, g *echo.Group) error {
	f, err := NewFetcher(nil, conf.CMSBase)
	if err != nil {
		return err
	}

	g.Use(
		middleware.CORS(),
		middleware.Gzip(),
		putil.NewCacheMiddleware(putil.CacheConfig{
			Disabled:     conf.DisableCache,
			TTL:          time.Duration(conf.CacheTTL) * time.Second,
			CacheControl: true,
		}).Middleware(),
	)

	g.GET("", func(c echo.Context) error {
		if conf.CMSProject == "" {
			return rerror.ErrNotFound
		}

		res, err := f.Do(c.Request().Context(), conf.CMSProject)
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	})

	g.GET("/:project", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context(), c.Param("project"))
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	})

	return nil
}

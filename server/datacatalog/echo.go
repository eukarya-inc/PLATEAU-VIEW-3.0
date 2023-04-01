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

func Echo(cfg Config, e *echo.Group) error {
	f, err := NewFetcher(nil, cfg.CMSBase)
	if err != nil {
		return err
	}

	c := putil.NewCacheMiddleware(putil.CacheConfig{
		Disabled: cfg.DisableCache,
		TTL:      time.Duration(cfg.CacheTTL) * time.Second,
	})
	if err != nil {
		return err
	}

	e.GET("", func(c echo.Context) error {
		if cfg.CMSProject == "" {
			return rerror.ErrNotFound
		}

		res, err := f.Do(c.Request().Context(), cfg.CMSProject)
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	}, middleware.CORS(), c.Middleware())

	e.GET("/:project", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context(), c.Param("project"))
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	}, middleware.CORS(), c.Middleware())

	return nil
}

package datacatalog

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
)

func Echo(cfg Config, e *echo.Group) error {
	f, err := NewFetcher(nil, cfg.CMSBase)
	if err != nil {
		return err
	}

	e.GET("", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context(), cfg.CMSProject)
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	}, middleware.CORS())

	e.GET("/:project", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context(), c.Param("project"))
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	}, middleware.CORS())

	return nil
}

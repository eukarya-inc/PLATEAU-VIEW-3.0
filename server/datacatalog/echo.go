package datacatalog

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func Echo(c Config, e *echo.Group) error {
	f, err := NewFetcher(nil, c)
	if err != nil {
		return nil
	}

	e.GET("", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context())
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	})

	e.GET("/citites", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context())
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.ByCities())
	})

	e.GET("/types", func(c echo.Context) error {
		res, err := f.Do(c.Request().Context())
		if err != nil {
			log.Errorf("datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.ByTypes())
	})
	return nil
}

package sidebar

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Config struct {
	CMSBaseURL      string
	CMSMainToken    string
	CMSTokenProject string
	// compat
	CMSMainProject string
	AdminToken     string
}

func Echo(g *echo.Group, c Config) error {
	h, err := NewHandler(c)
	if err != nil {
		return err
	}

	g.Use(middleware.CORS(), middleware.BodyLimit("5M"), h.AuthMiddleware())

	g.GET("/:pid", h.fetchRoot())
	g.GET("/:pid/data", h.getAllDataHandler())
	g.GET("/:pid/data/:iid", h.getDataHandler())
	g.POST("/:pid/data", h.createDataHandler())
	g.PATCH("/:pid/data/:iid", h.updateDataHandler())
	g.DELETE("/:pid/data/:iid", h.deleteDataHandler())
	g.GET("/:pid/templates", h.fetchTemplatesHandler())
	g.GET("/:pid/templates/:tid", h.fetchTemplateHandler())
	g.POST("/:pid/templates", h.createTemplateHandler())
	g.PATCH("/:pid/templates/:tid", h.updateTemplateHandler())
	g.DELETE("/:pid/templates/:tid", h.deleteTemplateHandler())

	return nil
}

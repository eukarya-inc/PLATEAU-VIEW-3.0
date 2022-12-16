package cmsintegration

import (
	"github.com/labstack/echo/v4"
)

func Echo(g *echo.Group, c Config) error {
	s, err := NewServices(c)
	if err != nil {
		return err
	}

	g.POST("/notify", NotifyHandler(s.CMS, c.Secret))
	return nil
}

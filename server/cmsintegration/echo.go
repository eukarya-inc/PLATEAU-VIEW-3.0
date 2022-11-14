package cmsintegration

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/webhook"
	"github.com/labstack/echo/v4"
)

func Echo(g *echo.Group, c Config) error {
	s, err := NewServices(c)
	if err != nil {
		return err
	}

	initEcho(g, c, s)
	return nil
}

func initEcho(g *echo.Group, c Config, s Services) {
	g.POST("/notify", NotifyHandler(s.CMS, c.Secret))
	g.POST("/webhook", WebhookHandler(s.FME, s.CMS, c.CMSModelID, c.CMSCityGMLFieldID, c.CMSBldgFieldID, c.Secret), webhook.EchoMiddleware([]byte(c.CMSWebhookSecret)))
}

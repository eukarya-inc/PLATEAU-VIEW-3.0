package opinion

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

const defaultToName = "PLATEAU VIEW ご意見ご要望"
const titlePrefix = "【PLATEAU VIEW ご意見ご要望】"

type Config struct {
	SendGridAPIKey string
	Email          string
	ToName         string
}

type req struct {
	Title   string `json:"title" form:"title" validate:"required"`
	Name    string `json:"name" form:"name" validate:"required"`
	Email   string `json:"email" form:"email" validate:"required,email"`
	Content string `json:"content" form:"content" validate:"required"`
}

func Echo(g *echo.Group, conf Config) {
	toName := conf.ToName
	if toName == "" {
		toName = defaultToName
	}
	client := sendgrid.NewSendClient(conf.SendGridAPIKey)

	g.POST("", func(c echo.Context) error {
		r := req{}
		if err := c.Bind(&r); err != nil {
			return err
		}
		if err := c.Validate(r); err != nil {
			return err
		}

		from := mail.NewEmail(r.Name, r.Email)
		to := mail.NewEmail(toName, conf.Email)
		title := fmt.Sprintf("%s%s", titlePrefix, r.Title)
		message := mail.NewSingleEmailPlainText(from, title, to, r.Content)

		response, err := client.Send(message)
		if err != nil {
			e := ""
			if err != nil {
				e = err.Error()
			} else {
				e = fmt.Sprintf("code=%d,body=%s", response.StatusCode, response.Body)
			}

			log.Errorf("opinion: failed to send email: %s", e)
			return c.JSON(http.StatusBadGateway, "failed to send an email")
		}

		return c.JSON(http.StatusOK, "ok")
	}, middleware.BodyLimit("1M"))
}

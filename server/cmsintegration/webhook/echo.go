package webhook

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func EchoMiddleware(secret []byte) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			body, err := io.ReadAll(c.Request().Body)
			if err != nil {
				return errors.New("unprocessable entity")
			}

			if !validateSignature(c.Request().Header.Get(header), body, secret) {
				return c.JSON(http.StatusUnauthorized, "unauthorized")
			}

			log.Infof("webhook: received: %s", body)

			p := &Payload{}
			if err := json.Unmarshal(body, p); err != nil {
				return c.JSON(http.StatusBadRequest, "invalid payload")
			}

			req := c.Request()
			c.SetRequest(c.Request().WithContext(AttacPayload(req.Context(), p)))
			return next(c)
		}
	}
}

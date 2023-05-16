package sdk

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

type FMEResult struct {
	ID        string `json:"id"`
	ResultURL string `json:"resultUrl"`
}

func NotifyHandler(conf Config) (echo.HandlerFunc, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(c echo.Context) error {
		ctx := c.Request().Context()

		var f FMEResult
		if err := c.Bind(&f); err != nil {
			log.Info("sdk notify: invalid payload: %w", err)
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		log.Infof("sdk notify: received: %+v", f)

		if err := s.ReceiveFMEResult(ctx, f); err != nil {
			if errors.Is(err, ErrInvalidID) {
				return c.JSON(http.StatusUnauthorized, "unauthorized")
			}
			log.Errorf("sdk notify: error: %v", err)
			return nil
		}

		log.Infof("sdk notify: done")
		return nil
	}, nil
}

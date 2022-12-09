package share

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
)

type Config struct {
	CMSBase        string
	CMSToken       string
	CMSModelID     string
	CMSDataFieldID string
}

func Echo(g *echo.Group, conf Config) error {
	cmsapi, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return fmt.Errorf("share: failed to init cms: %w", err)
	}

	g.GET("/:id", func(c echo.Context) error {
		res, err := cmsapi.GetItem(c.Request().Context(), c.Param("id"))
		if err != nil {
			if strings.Contains(err.Error(), "not found") {
				return c.JSON(http.StatusNotFound, "not found")
			}
			log.Errorf("share: failed to get an item: %s", err)
			return c.JSON(http.StatusInternalServerError, "internal server error")
		}

		f := res.Field(conf.CMSDataFieldID)
		if f == nil {
			log.Errorf("share: item got, but field %s does not contain: %+v", conf.CMSDataFieldID, res)
			return c.JSON(http.StatusNotFound, "not found")
		}

		v, ok := f.Value.(string)
		if !ok {
			log.Errorf("share: item got, but field %s's value is not a string: %+v", conf.CMSDataFieldID, res)
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.Blob(http.StatusOK, "application/json", []byte(v))
	})

	g.POST("", func(c echo.Context) error {
		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return c.JSON(http.StatusUnprocessableEntity, "failed to read body")
		}

		if !json.Valid(body) {
			return c.JSON(http.StatusBadRequest, "invalid json")
		}

		res, err := cmsapi.CreateItem(c.Request().Context(), conf.CMSModelID, []cms.Field{
			{ID: conf.CMSDataFieldID, Type: "text", Value: string(body)},
		})
		if err != nil {
			log.Errorf("share: failed to create an item: %s", err)
			return c.JSON(http.StatusInternalServerError, "internal server error")
		}

		return c.JSON(http.StatusOK, res.ID)
	}, middleware.BodyLimit("1M"))

	return nil
}

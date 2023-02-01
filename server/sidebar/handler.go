package sidebar

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
)

const (
	dataModelKey     = "sidebar-data"
	templateModelKey = "sidebar-template"
	dataField        = "data"
)

type Handler struct {
	CMSProject string
	CMS        cms.Interface
}

func NewHandler(CMS cms.Interface, prj string) *Handler {
	return &Handler{
		CMSProject: prj,
		CMS:        CMS,
	}
}

// GET /:pid
func (h *Handler) fetchRoot() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		data, err := h.CMS.GetItemsByKey(ctx, h.CMSProject, dataModelKey)
		if err != nil {
			return err
		}

		templates, err := h.CMS.GetItemsByKey(ctx, h.CMSProject, templateModelKey)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, map[string]any{
			"data":      itemsToJSONs(data.Items),
			"templates": itemsToJSONs(templates.Items),
		})
	}
}

// GET /:pid/data
func (h *Handler) getAllDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		data, err := h.CMS.GetItemsByKey(ctx, h.CMSProject, dataModelKey)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, itemsToJSONs(data.Items))
	}
}

// GET /:pid/data/:iid
func (h *Handler) getDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		itemID := c.Param("iid")
		if itemID == "" {
			return c.JSON(http.StatusNotFound, nil)
		}

		data, err := h.CMS.GetItem(ctx, itemID)
		if err != nil {
			return err
		}

		res, err := data.FieldByKey(dataField).ValueJSON()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

// POST /:pid/data
func (h *Handler) createDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}
		item, err := h.CMS.CreateItemByKey(ctx, h.CMSProject, dataModelKey, fields)
		if err != nil {
			return err
		}

		res, err := item.FieldByKey(dataField).ValueJSON()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

// PATCH /:pid/data/:did
func (h *Handler) updateDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		itemID := c.Param("iid")
		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}

		item, err := h.CMS.UpdateItem(ctx, itemID, fields)
		if err != nil {
			return err
		}

		res, err := item.FieldByKey(dataField).ValueJSON()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:pid/data/:did
func (h *Handler) deleteDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		itemID := c.Param("iid")

		err := h.CMS.DeleteItem(ctx, itemID)
		if err != nil {
			return err
		}

		return c.NoContent(http.StatusNoContent)
	}
}

// GET /:pid/templates
func (h *Handler) fetchTemplatesHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		templates, err := h.CMS.GetItemsByKey(ctx, h.CMSProject, templateModelKey)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, itemsToJSONs(templates.Items))
	}
}

// GET /:pid/templates/:tid
func (h *Handler) fetchTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		templateID := c.Param("tid")
		template, err := h.CMS.GetItem(ctx, templateID)
		if err != nil {
			return err
		}

		res, err := template.FieldByKey(dataField).ValueJSON()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

// POST /:pid/templates
func (h *Handler) createTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}

		item, err := h.CMS.CreateItemByKey(ctx, h.CMSProject, templateModelKey, fields)
		if err != nil {
			return err
		}

		res, err := item.FieldByKey(dataField).ValueJSON()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

// PATCH /:id/templates/:tid
func (h *Handler) updateTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		templateID := c.Param("tid")
		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}

		item, err := h.CMS.UpdateItem(ctx, templateID, fields)
		if err != nil {
			return err
		}

		res, err := item.FieldByKey(dataField).ValueJSON()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:id/templates/:tid
func (h *Handler) deleteTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		templateID := c.Param("tid")

		err := h.CMS.DeleteItem(ctx, templateID)
		if err != nil {
			return err
		}

		return c.NoContent(http.StatusOK)
	}
}

func itemsToJSONs(items []cms.Item) []any {
	return lo.FilterMap(items, func(d cms.Item, _ int) (any, bool) {
		j, err := d.FieldByKey(dataField).ValueJSON()
		return j, err == nil
	})
}

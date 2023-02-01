package sidebar

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	dataModelKey     = "sidebar-data"
	templateModelKey = "sidebar-template"
	dataField        = "data"
)

type Handler struct {
	CMS cms.Interface
}

func NewHandler(CMS cms.Interface) *Handler {
	return &Handler{
		CMS: CMS,
	}
}

// GET /:pid
func (h *Handler) fetchRoot() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")

		data, err := h.CMS.GetItemsByKey(ctx, prj, dataModelKey)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		templates, err := h.CMS.GetItemsByKey(ctx, prj, templateModelKey)
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
		prj := c.Param("pid")

		data, err := h.CMS.GetItemsByKey(ctx, prj, dataModelKey)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
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
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := fieldJSON(data.FieldByKey(dataField))
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// POST /:pid/data
func (h *Handler) createDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")
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
		item, err := h.CMS.CreateItemByKey(ctx, prj, dataModelKey, fields)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := fieldJSON(item.FieldByKey(dataField))
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
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
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := fieldJSON(item.FieldByKey(dataField))
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:pid/data/:did
func (h *Handler) deleteDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		itemID := c.Param("iid")

		if err := h.CMS.DeleteItem(ctx, itemID); err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.NoContent(http.StatusNoContent)
	}
}

// GET /:pid/templates
func (h *Handler) fetchTemplatesHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")

		res, err := h.CMS.GetItemsByKey(ctx, prj, templateModelKey)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.JSON(http.StatusOK, itemsToJSONs(res.Items))
	}
}

// GET /:pid/templates/:tid
func (h *Handler) fetchTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()

		templateID := c.Param("tid")
		template, err := h.CMS.GetItem(ctx, templateID)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := fieldJSON(template.FieldByKey(dataField))
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// POST /:pid/templates
func (h *Handler) createTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")
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

		item, err := h.CMS.CreateItemByKey(ctx, prj, templateModelKey, fields)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := fieldJSON(item.FieldByKey(dataField))
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
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
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := fieldJSON(item.FieldByKey(dataField))
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:id/templates/:tid
func (h *Handler) deleteTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		templateID := c.Param("tid")

		if err := h.CMS.DeleteItem(ctx, templateID); err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.NoContent(http.StatusOK)
	}
}

func itemsToJSONs(items []cms.Item) []any {
	return lo.FilterMap(items, func(d cms.Item, _ int) (any, bool) {
		j := fieldJSON(d.FieldByKey(dataField))
		return j, j != nil
	})
}

func fieldJSON(f *cms.Field) any {
	j, err := f.ValueJSON()
	if j == nil || err != nil {
		return nil
	}
	if f.ID != "" {
		if o, ok := j.(map[string]any); ok {
			o["id"] = f.ID
			return o
		}
	}
	return j
}

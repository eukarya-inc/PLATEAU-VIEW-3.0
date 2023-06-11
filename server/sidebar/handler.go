package sidebar

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	dataModelKey      = "sidebar-data"
	templateModelKey  = "sidebar-template"
	dataField         = "data"
	tokenProject      = "system"
	tokenModel        = "workspaces"
	tokenProjectField = "project_alias"
	tokenTokenField   = "cms_apikey"
	limit             = 10
)

type Handler struct {
	cmsbase         string
	cmsMainProject  string
	cmsTokenProject string
	cmsMain         cms.Interface
}

func NewHandler(c Config) (*Handler, error) {
	cmsMain, err := cms.New(c.CMSBaseURL, c.CMSMainToken)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cms: %w", err)
	}

	if c.CMSTokenProject == "" {
		c.CMSTokenProject = tokenProject
	}

	return &Handler{
		cmsbase:         c.CMSBaseURL,
		cmsMainProject:  c.CMSMainProject,
		cmsTokenProject: c.CMSTokenProject,
		cmsMain:         cmsMain,
	}, nil
}

// GET /:pid
func (h *Handler) fetchRoot() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")
		cmsh, err2 := h.cms(ctx, prj)
		if err2 != nil {
			return err2
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.lastModified(c, prj, dataModelKey, templateModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		dataCh := make(chan []cms.Item, 1)
		dataErrCh := make(chan error, 1)
		templatesCh := make(chan []cms.Item, 1)
		templateErrCh := make(chan error, 1)

		go func() {
			data, err := cmsh.GetItemsByKeyInParallel(ctx, prj, dataModelKey, false, limit)
			if err != nil {
				dataErrCh <- err
				return
			}
			dataCh <- data.Items
			close(dataErrCh)
		}()

		go func() {
			templates, err := cmsh.GetItemsByKeyInParallel(ctx, prj, templateModelKey, false, limit)
			if err != nil {
				templateErrCh <- err
				return
			}
			templatesCh <- templates.Items
			close(templateErrCh)
		}()

		err := <-dataErrCh
		if err == nil {
			err = <-templateErrCh
		}
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.JSON(http.StatusOK, map[string]any{
			"data":      itemsToJSONs(<-dataCh),
			"templates": itemsToJSONs(<-templatesCh),
		})
	}
}

// GET /:pid/data
func (h *Handler) getAllDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.lastModified(c, prj, dataModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		data, err := cmsh.GetItemsByKeyInParallel(ctx, prj, dataModelKey, false, limit)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
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
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

		itemID := c.Param("iid")
		if itemID == "" {
			return c.JSON(http.StatusNotFound, nil)
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		item, err := cmsh.GetItem(ctx, itemID, false)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(item.FieldByKey(dataField), item.ID)
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
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

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
		item, err := cmsh.CreateItemByKey(ctx, prj, dataModelKey, fields)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(item.FieldByKey(dataField), item.ID)
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
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

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

		item, err := cmsh.UpdateItem(ctx, itemID, fields)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(item.FieldByKey(dataField), item.ID)
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
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

		if err := cmsh.DeleteItem(ctx, itemID); err != nil {
			if errors.Is(err, cms.ErrNotFound) {
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
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.lastModified(c, prj, templateModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		res, err := cmsh.GetItemsByKeyInParallel(ctx, prj, templateModelKey, false, limit)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
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
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

		templateID := c.Param("tid")
		template, err := cmsh.GetItem(ctx, templateID, false)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(template.FieldByKey(dataField), template.ID)
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
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

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

		template, err := cmsh.CreateItemByKey(ctx, prj, templateModelKey, fields)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(template.FieldByKey(dataField), template.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// PATCH /:pid/templates/:tid
func (h *Handler) updateTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}

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

		template, err := cmsh.UpdateItem(ctx, templateID, fields)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(template.FieldByKey(dataField), template.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:pid/templates/:tid
func (h *Handler) deleteTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		prj := c.Param("pid")
		cmsh, err := h.cms(ctx, prj)
		if err != nil {
			return err
		}
		templateID := c.Param("tid")

		if err := cmsh.DeleteItem(ctx, templateID); err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.NoContent(http.StatusOK)
	}
}

func itemsToJSONs(items []cms.Item) []any {
	return lo.FilterMap(items, func(i cms.Item, _ int) (any, bool) {
		j := itemJSON(i.FieldByKey(dataField), i.ID)
		return j, j != nil
	})
}

func itemJSON(f *cms.Field, id string) any {
	j, err := f.ValueJSON()
	if j == nil || err != nil {
		return nil
	}
	if f.ID != "" {
		if o, ok := j.(map[string]any); ok {
			o["id"] = id
			return o
		}
	}
	return j
}

func (h *Handler) lastModified(c echo.Context, prj string, models ...string) (bool, error) {
	ctx := c.Request().Context()
	cmsh, err := h.cms(ctx, prj)
	if err != nil {
		return false, err
	}

	mlastModified := time.Time{}
	for _, m := range models {
		model, err := cmsh.GetModelByKey(ctx, prj, m)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return false, c.JSON(http.StatusNotFound, "not found")
			}
			return false, err
		}

		if model != nil && mlastModified.Before(model.LastModified) {
			mlastModified = model.LastModified
		}
	}

	return putil.LastModified(c, mlastModified)
}

func (h *Handler) cms(ctx context.Context, prj string) (cms.Interface, error) {
	if h.cmsMainProject != "" && h.cmsMainProject == prj {
		return h.cmsMain, nil
	}

	token, err := h.getToken(ctx, prj)
	if err != nil {
		return nil, err
	}

	c, err := cms.New(h.cmsbase, token)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("sidebar: failed to create cms for %s: %w", prj, err))
	}

	return c, nil
}

func (h *Handler) getToken(ctx context.Context, prj string) (string, error) {
	if h.cmsTokenProject == "" {
		return "", rerror.ErrNotFound
	}

	items, err := h.cmsMain.GetItemsByKeyInParallel(ctx, h.cmsTokenProject, tokenModel, false, 100)
	if err != nil {
		if errors.Is(err, cms.ErrNotFound) {
			return "", rerror.ErrNotFound
		}
		return "", rerror.ErrInternalBy(fmt.Errorf("sidebar: failed to get token: %w", err))
	}

	item, ok := lo.Find(items.Items, func(i cms.Item) bool {
		s := i.FieldByKey(tokenProjectField).ValueString()
		return s != nil && *s == prj
	})
	if !ok {
		return "", rerror.ErrNotFound
	}

	token := item.FieldByKey(tokenTokenField).ValueString()
	if token == nil || *token == "" {
		return "", rerror.ErrNotFound
	}

	return *token, nil
}

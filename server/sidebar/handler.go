package sidebar

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
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
	limit             = 10
)

type Handler struct {
	cmsbase         string
	cmsTokenProject string
	cmsMain         cms.Interface
	// comapt
	cmsMainProject string
	cmsToken       string
	adminToken     string
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
		cmsTokenProject: c.CMSTokenProject,
		cmsMain:         cmsMain,
		// compat
		cmsMainProject: c.CMSMainProject,
		cmsToken:       c.CMSMainToken,
		adminToken:     c.AdminToken,
	}, nil
}

// GET /:pid
func (h *Handler) fetchRoot() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := getCMSMetadataFromContext(ctx)
		cmsh := getCMSFromContext(ctx)

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.lastModified(c, md.ProjectAlias, dataModelKey, templateModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		dataCh := make(chan []cms.Item, 1)
		dataErrCh := make(chan error, 1)
		templatesCh := make(chan []cms.Item, 1)
		templateErrCh := make(chan error, 1)

		go func() {
			data, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, dataModelKey, false, limit)
			if err != nil {
				dataErrCh <- err
				return
			}
			if data == nil {
				dataCh <- nil
			} else {
				dataCh <- data.Items
			}
			close(dataErrCh)
		}()

		go func() {
			templates, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, templateModelKey, false, limit)
			if err != nil {
				templateErrCh <- err
				return
			}
			if templates == nil {
				templatesCh <- nil
			} else {
				templatesCh <- templates.Items
			}
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
		md := getCMSMetadataFromContext(ctx)
		cmsh := getCMSFromContext(ctx)

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.lastModified(c, md.ProjectAlias, dataModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		data, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, dataModelKey, false, limit)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		if data == nil {
			return c.JSON(http.StatusOK, itemsToJSONs(nil))
		}
		return c.JSON(http.StatusOK, itemsToJSONs(data.Items))
	}
}

// GET /:pid/data/:iid
func (h *Handler) getDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		cmsh := getCMSFromContext(ctx)

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
		md := getCMSMetadataFromContext(ctx)
		cmsh := getCMSFromContext(ctx)

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
		item, err := cmsh.CreateItemByKey(ctx, md.ProjectAlias, dataModelKey, fields)
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
		cmsh := getCMSFromContext(ctx)

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
		cmsh := getCMSFromContext(ctx)
		itemID := c.Param("iid")

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
		md := getCMSMetadataFromContext(ctx)
		cmsh := getCMSFromContext(ctx)

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.lastModified(c, md.ProjectAlias, templateModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		res, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, templateModelKey, false, limit)
		if err != nil || res == nil {
			if errors.Is(err, cms.ErrNotFound) || res == nil {
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
		cmsh := getCMSFromContext(ctx)

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
		cmsh := getCMSFromContext(ctx)
		md := getCMSMetadataFromContext(ctx)

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

		template, err := cmsh.CreateItemByKey(ctx, md.ProjectAlias, templateModelKey, fields)
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
		cmsh := getCMSFromContext(ctx)

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
		cmsh := getCMSFromContext(ctx)

		templateID := c.Param("tid")

		if err := cmsh.DeleteItem(ctx, templateID); err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.NoContent(http.StatusNoContent)
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
	cmsh := getCMSFromContext(ctx)

	mlastModified := time.Time{}
	for _, m := range models {
		model, err := cmsh.GetModelByKey(ctx, prj, m)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				continue
			}
			return false, err
		}

		if model != nil && mlastModified.Before(model.LastModified) {
			mlastModified = model.LastModified
		}
	}

	return putil.LastModified(c, mlastModified)
}

func (h *Handler) AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()
			prj := c.Param("pid")

			md, err := h.getMetadata(ctx, prj)
			if err != nil {
				return err
			}

			cmsh, err := cms.New(h.cmsbase, md.CMSAPIKey)
			if err != nil {
				return rerror.ErrInternalBy(fmt.Errorf("sidebar: failed to create cms for %s: %w", prj, err))
			}

			// auth
			if req.Method == http.MethodPost || req.Method == http.MethodPatch || req.Method == http.MethodPut || req.Method == http.MethodDelete {
				header := req.Header.Get("Authorization")
				token := strings.TrimPrefix(header, "Bearer ")
				if md.SidebarAccessToken == "" || token != md.SidebarAccessToken {
					return c.JSON(http.StatusUnauthorized, nil)
				}
			}

			// attach
			ctx = context.WithValue(ctx, cmsMetadataContextKey{}, md)
			ctx = context.WithValue(ctx, cmsContextKey{}, cmsh)
			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

type cmsContextKey struct{}
type cmsMetadataContextKey struct{}

func getCMSFromContext(ctx context.Context) cms.Interface {
	return ctx.Value(cmsContextKey{}).(cms.Interface)
}

func getCMSMetadataFromContext(ctx context.Context) Metadata {
	return ctx.Value(cmsMetadataContextKey{}).(Metadata)
}

type Metadata struct {
	ProjectAlias       string `json:"project_alias" cms:"project_alias,text"`
	CMSAPIKey          string `json:"cms_apikey" cms:"cms_apikey,text"`
	SidebarAccessToken string `json:"sidebar_access_token" cms:"sidebar_access_token,text"`
}

func (h *Handler) getMetadata(ctx context.Context, prj string) (Metadata, error) {
	// compat
	if h.cmsMainProject != "" && prj == h.cmsMainProject {
		return Metadata{
			ProjectAlias:       h.cmsMainProject,
			CMSAPIKey:          h.cmsToken,
			SidebarAccessToken: h.adminToken,
		}, nil
	}

	if h.cmsTokenProject == "" {
		return Metadata{}, rerror.ErrNotFound
	}

	items, err := h.cmsMain.GetItemsByKeyInParallel(ctx, h.cmsTokenProject, tokenModel, false, 100)
	if err != nil || items == nil {
		if errors.Is(err, cms.ErrNotFound) || items == nil {
			return Metadata{}, rerror.ErrNotFound
		}
		return Metadata{}, rerror.ErrInternalBy(fmt.Errorf("sidebar: failed to get token: %w", err))
	}

	item, ok := lo.Find(items.Items, func(i cms.Item) bool {
		s := i.FieldByKey(tokenProjectField).ValueString()
		return s != nil && *s == prj
	})
	if !ok {
		return Metadata{}, rerror.ErrNotFound
	}

	m := Metadata{}
	item.Unmarshal(&m)
	if m.CMSAPIKey == "" {
		return Metadata{}, rerror.ErrNotFound
	}

	return m, nil
}

package plateaucms

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
)

const (
	ProjectNameParam             = "pid"
	tokenProject                 = "system"
	metadataModel                = "workspaces"
	plateauSpecModel             = "plateau-spec"
	plateauProjectModel          = "plateau-projects"
	projectAliasField            = "project_alias"
	datacatalogProjectAliasField = "datacatalog_project_alias"
	plateauPrefix                = "plateau-"
)

var HTTPMethodsAll = []string{
	http.MethodGet,
	http.MethodPost,
	http.MethodPatch,
	http.MethodPut,
	http.MethodDelete,
}

var HTTPMethodsExceptGET = []string{
	http.MethodPost,
	http.MethodPatch,
	http.MethodPut,
	http.MethodDelete,
}

type Config struct {
	CMSBaseURL      string
	CMSMainToken    string
	CMSTokenProject string
	// compat
	CMSMainProject string
	AdminToken     string
}

type CMS struct {
	cmsbase            string
	cmsMetadataProject string
	cmsMain            cms.Interface
	// comapt
	cmsMainProject string
	cmsToken       string
	adminToken     string
}

func New(c Config) (*CMS, error) {
	cmsMain, err := cms.New(c.CMSBaseURL, c.CMSMainToken)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cms: %w", err)
	}

	if c.CMSTokenProject == "" {
		c.CMSTokenProject = tokenProject
	}

	return &CMS{
		cmsbase:            c.CMSBaseURL,
		cmsMetadataProject: c.CMSTokenProject,
		cmsMain:            cmsMain,
		// compat
		cmsMainProject: c.CMSMainProject,
		cmsToken:       c.CMSMainToken,
		adminToken:     c.AdminToken,
	}, nil
}

func (h *CMS) Clone() *CMS {
	return &CMS{
		cmsbase:            h.cmsbase,
		cmsMetadataProject: h.cmsMetadataProject,
		cmsMain:            h.cmsMain,
		// compat
		cmsMainProject: h.cmsMainProject,
		cmsToken:       h.cmsToken,
		adminToken:     h.adminToken,
	}
}

type AuthMiddlewareConfig struct {
	Key             string
	AuthMethods     []string
	FindDataCatalog bool
	DefaultProject  string
	UseDefault      bool
}

func (h *CMS) LastModified(c echo.Context, prj string, models ...string) (bool, error) {
	ctx := c.Request().Context()
	cmsh := GetCMSFromContext(ctx)

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

func (h *CMS) AuthMiddleware(conf AuthMiddlewareConfig) echo.MiddlewareFunc {
	key := conf.Key
	authMethods := conf.AuthMethods
	findDataCatalog := conf.FindDataCatalog
	defaultProject := conf.DefaultProject
	useDefault := conf.UseDefault

	if key == "" {
		key = ProjectNameParam
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()
			prj := c.Param(key)
			if prj == "" {
				prj = defaultProject
			}

			md, all, err := h.Metadata(ctx, prj, findDataCatalog, useDefault)
			if len(all) > 0 {
				ctx = context.WithValue(ctx, cmsAllMetadataContextKey{}, all)
			}

			if err != nil {
				if errors.Is(err, rerror.ErrNotFound) {
					ctx = context.WithValue(ctx, cmsMetadataContextKey{}, md)
					c.SetRequest(req.WithContext(ctx))
					return next(c)
				}
				return err
			}

			cmsh, err := cms.New(h.cmsbase, md.CMSAPIKey)
			if err != nil {
				return rerror.ErrInternalBy(fmt.Errorf("plateaucms: failed to create cms for %s: %w", prj, err))
			}

			// auth
			header := req.Header.Get("Authorization")
			token := strings.TrimPrefix(header, "Bearer ")
			if md.SidebarAccessToken == "" || token != md.SidebarAccessToken {
				if len(authMethods) > 0 && slices.Contains(authMethods, req.Method) {
					return c.JSON(http.StatusUnauthorized, "unauthorized")
				}
			} else {
				md.Auth = true
			}

			// attach
			ctx = context.WithValue(ctx, plateauCMSContextKey{}, h)
			ctx = context.WithValue(ctx, cmsMetadataContextKey{}, md)
			ctx = context.WithValue(ctx, cmsContextKey{}, cmsh)
			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

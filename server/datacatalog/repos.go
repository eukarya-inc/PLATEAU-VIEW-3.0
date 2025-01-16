package datacatalog

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogv2adapter"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv3"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/geocoding"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/reearth-plateauview/server/geo"
	"github.com/eukarya-inc/reearth-plateauview/server/geo/jisx0410"
	"github.com/eukarya-inc/reearth-plateauview/server/geo/spatialid"
	"github.com/eukarya-inc/reearth-plateauview/server/govpolygon"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
	"golang.org/x/sync/errgroup"
)

var qt *govpolygon.Quadtree

func init() {
	qt = govpolygon.NewQuadtree(nil, 1.0/60.0)
}

type Repo struct {
	h *reposHandler
}

func NewRepo(conf Config) (*Repo, error) {
	h, err := newReposHandler(conf)
	if err != nil {
		return nil, err
	}
	return &Repo{
		h: h,
	}, nil
}

func (r *Repo) PlateauAPI() (plateauapi.Repo, error) {
	ctx := context.Background()
	metadata, err := r.h.pcms.AllMetadata(ctx, true)
	if err != nil {
		return nil, fmt.Errorf("failed to get all metadata: %w", err)
	}
	return r.h.prepareAndGetMergedRepo(ctx, "", metadata), nil
}

func (r *Repo) Govpolygon() *govpolygon.Quadtree {
	return r.h.qt
}

type reposHandler struct {
	reposv3            *datacatalogv3.Repos
	reposv2            *datacatalogv2adapter.Repos
	pcms               *plateaucms.CMS
	gqlComplexityLimit int
	cacheUpdateKey     string
	geocodingAppID     string

	qt *govpolygon.Quadtree
}

const pidParamName = "pid"
const conditionsParamName = "conditions"
const gqlComplexityLimit = 1000
const cmsSchemaVersion = "v3"
const cmsSchemaVersionV2 = "v2"

func newReposHandler(conf Config) (*reposHandler, error) {
	pcms, err := plateaucms.New(conf.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize plateau cms: %w", err)
	}

	reposv3 := datacatalogv3.NewRepos(pcms)
	reposv2 := datacatalogv2adapter.NewRepos()

	if conf.GraphqlMaxComplexity <= 0 {
		conf.GraphqlMaxComplexity = gqlComplexityLimit
	}

	if conf.DiskCache {
		reposv3.EnableCache(true)
	}

	if conf.Debug {
		reposv3.EnableDebug(true)
	}

	return &reposHandler{
		reposv3:            reposv3,
		reposv2:            reposv2,
		pcms:               pcms,
		gqlComplexityLimit: conf.GraphqlMaxComplexity,
		cacheUpdateKey:     conf.CacheUpdateKey,
		geocodingAppID:     conf.GeocodingAppID,
		qt:                 qt,
	}, nil
}

func (h *reposHandler) Middleware() echo.MiddlewareFunc {
	return h.pcms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:             pidParamName,
		FindDataCatalog: true,
		UseDefault:      true,
	})
}

func (h *reposHandler) Handler(admin bool) echo.HandlerFunc {
	return func(c echo.Context) error {
		merged, err := h.prepareMergedRepo(c, admin)
		if err != nil {
			return err
		}

		srv := plateauapi.NewService(merged, plateauapi.FixedComplexityLimit(h.gqlComplexityLimit))

		adminContext(c, admin, admin, admin && isAlpha(c))
		srv.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func (h *reposHandler) CityGMLFiles(admin bool) echo.HandlerFunc {
	return func(c echo.Context) error {
		var cityIDs []string
		var filter cityGMLFileFilterFunc
		conditions := c.Param(conditionsParamName)
		switch conditionType, cond := parseConditions(conditions); conditionType {
		case "m":
			var bounds []geo.Bounds2
			for _, m := range strings.Split(cond, ",") {
				b, err := jisx0410.Parse(m)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("invalid mesh: %w", err))
				}
				bounds = append(bounds, b.Bounds)
				cityIDs = append(cityIDs, h.qt.FindRect(b.Bounds.QBounds())...)
			}
			if len(bounds) > 10 {
				log.Warnfc(c.Request().Context(), "too many bounds: %d", len(bounds))
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("too many bounds"))
			}
			filter = boundsCityGMLFileFilter(bounds)
		case "mm":
			var bounds []geo.Bounds2
			var levels [7]int
			for _, m := range strings.Split(cond, ",") {
				b, err := jisx0410.Parse(m)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("invalid mesh: %w", err))
				}
				if b.Level == 0 {
					return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("unsupported mesh: %s", m))
				}
				levels[b.Level]++
				bounds = append(bounds, b.Bounds)
				cityIDs = append(cityIDs, h.qt.FindRect(b.Bounds.QBounds())...)
			}
			if len(bounds) > 10 {
				log.Warnfc(c.Request().Context(), "too many bounds: %d", len(bounds))
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("too many bounds"))
			}
			switch {
			case levels[2] == len(bounds):
				filter = levelCityGMLFileFilter(2, bounds)
			case levels[3] == len(bounds):
				filter = levelCityGMLFileFilter(3, bounds)
			default:
				log.Warnfc(c.Request().Context(), "bounds for different levels: %v", levels)
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("invalid bounds"))
			}
		case "s":
			var bounds []geo.Bounds2
			for _, s := range strings.Split(cond, ",") {
				b3, err := spatialid.Bounds(s)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("invalid spatial id: %w", err))
				}
				b := b3.ToXY()
				bounds = append(bounds, b)
				cityIDs = h.qt.FindRect(b.QBounds())
			}
			if len(bounds) > 10 {
				log.Warnfc(c.Request().Context(), "too many bounds: %d", len(bounds))
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("too many bounds"))
			}
			filter = boundsCityGMLFileFilter(bounds)
		case "r":
			b, err := parseBounds(cond)
			if err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("invalid rectangle: %w", err))
			}
			filter = boundsCityGMLFileFilter([]geo.Bounds2{geo.ToBounds2(b)})
			cityIDs = h.qt.FindRect(b)
		case "g":
			ctx := context.TODO()
			b, err := geocoding.NewClient(h.geocodingAppID).Bounds(ctx, cond)
			if errors.Is(err, geocoding.ErrNotFound) {
				return echo.NewHTTPError(http.StatusNotFound, "not found")
			}
			if err != nil {
				return echo.NewHTTPError(http.StatusServiceUnavailable, fmt.Errorf("geocoding: %w", err))
			}
			filter = boundsCityGMLFileFilter([]geo.Bounds2{geo.ToBounds2(b)})
			cityIDs = h.qt.FindRect(b)
		case "":
			if cond == "" {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("no conditions"))
			}
			cityIDs = strings.Split(cond, ",")
		default:
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("invalid condition type: %s", conditionType))
		}

		merged, err := h.prepareMergedRepo(c, admin)
		if err != nil {
			return err
		}
		adminContext(c, true, admin, admin && isAlpha(c))
		ctx := c.Request().Context()

		var response struct {
			Cities       []*CityGMLFilesResponse       `json:"cities"`
			FeatureTypes map[string]CityGMLFeatureType `json:"featureTypes"`
			Next         string                        `json:"next,omitempty"`
		}

		response.FeatureTypes = make(map[string]CityGMLFeatureType)

		for _, cid := range lo.Uniq(cityIDs) {
			cityGMLFiles, err := FetchCityGMLFiles(ctx, merged, cid)
			if err != nil {
				return err
			}
			if cityGMLFiles == nil {
				continue
			}
			if filter != nil {
				for ft, cityGmlFiles := range cityGMLFiles.Files {
					filtered := cityGmlFiles[:0]
					for _, f := range cityGmlFiles {
						if filter(f) {
							filtered = append(filtered, f)
						}
					}
					if len(filtered) == 0 {
						delete(cityGMLFiles.Files, ft)
					} else {
						cityGMLFiles.Files[ft] = filtered
					}
				}
			}

			for code, ft := range cityGMLFiles.FeatureTypes {
				response.FeatureTypes[code] = ft
			}
			cityGMLFiles.FeatureTypes = nil // simplify response

			if len(cityGMLFiles.Files) > 0 {
				response.Cities = append(response.Cities, cityGMLFiles)
			}
		}
		if len(response.Cities) == 0 {
			return echo.NewHTTPError(http.StatusNotFound, "not found")
		}
		return c.JSON(http.StatusOK, response)
	}
}

func parseConditions(conditions string) (string, string) {
	t, body, found := strings.Cut(conditions, ":")
	if found {
		return t, body
	} else {
		return "", conditions
	}
}

func (h *reposHandler) SimplePlateauDatasetsAPI() echo.HandlerFunc {
	return func(c echo.Context) error {
		merged, err := h.prepareMergedRepo(c, false)
		if err != nil {
			return err
		}

		ctx := c.Request().Context()
		res, err := FetchSimplePlateauDatasets(ctx, merged)
		if err != nil {
			return err
		}

		return c.JSONPretty(http.StatusOK, res, "  ")
	}
}

func (h *reposHandler) UpdateCacheHandler(c echo.Context) error {
	ctx := c.Request().Context()

	if h.cacheUpdateKey != "" {
		b := struct {
			Key string `json:"key"`
		}{}
		if err := c.Bind(&b); err != nil {
			return echo.ErrUnauthorized
		}
		if b.Key != h.cacheUpdateKey {
			return echo.ErrUnauthorized
		}
	}

	metadata, err := h.pcms.AllMetadata(ctx, true)
	if err != nil {
		return fmt.Errorf("datacatalogv3: failed to get all metadata: %w", err)
	}

	ctx = plateaucms.SetAllCMSMetadataFromContext(ctx, metadata)

	if err := h.UpdateCache(ctx); err != nil {
		log.Errorfc(ctx, "datacatalog: failed to update cache: %v", err)
		return c.JSON(http.StatusInternalServerError, "failed to update cache")
	}

	return c.JSON(http.StatusOK, "ok")
}

func (h *reposHandler) WarningHandler(c echo.Context) error {
	pid := c.Param(pidParamName)
	md := plateaucms.GetCMSMetadataFromContext(c.Request().Context())
	if md.DataCatalogProjectAlias != pid || !isV3(md) {
		return echo.NewHTTPError(http.StatusNotFound, "not found")
	}

	if !md.Auth {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	t := h.reposv3.UpdatedAt(pid)
	res := ""
	if !t.IsZero() {
		res = fmt.Sprintf("updated at: %s\n", t.Format(time.RFC3339))
	}
	res += strings.Join(h.reposv3.Warnings(pid), "\n")
	return c.String(http.StatusOK, res)
}

func (h *reposHandler) UpdateCache(ctx context.Context) error {
	g, ctx := errgroup.WithContext(ctx)

	for _, p := range h.reposv3.Projects() {
		p := p
		g.Go(func() error {
			return h.updateV3(ctx, p)
		})
	}

	for _, p := range h.reposv2.Projects() {
		p := p
		g.Go(func() error {
			return h.updateV2(ctx, p)
		})
	}

	return g.Wait()
}

func (h *reposHandler) Init(ctx context.Context) error {
	metadata, err := h.pcms.AllMetadata(ctx, true)
	if err != nil {
		return fmt.Errorf("datacatalogv3: failed to get all metadata: %w", err)
	}

	ctx = plateaucms.SetAllCMSMetadataFromContext(ctx, metadata)

	plateauMetadata := metadata.PlateauProjects()
	if err := h.prepareAll(ctx, plateauMetadata); err != nil {
		return err
	}

	return nil
}

func (h *reposHandler) prepareMergedRepo(c echo.Context, auth bool) (plateauapi.Repo, error) {
	ctx := c.Request().Context()
	md := plateaucms.GetCMSMetadataFromContext(ctx)
	if auth && !md.Auth {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	pid := c.Param(pidParamName)
	mds := plateaucms.GetAllCMSMetadataFromContext(ctx)
	merged := h.prepareAndGetMergedRepo(ctx, pid, mds)
	if merged == nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "not found")
	}

	log.Debugfc(ctx, "datacatalogv3: use repo for %s: %s", pid, merged.Name())
	return merged, nil
}

func (h *reposHandler) prepareAndGetMergedRepo(ctx context.Context, project string, metadata plateaucms.MetadataList) plateauapi.Repo {
	var mds plateaucms.MetadataList
	if project == "" {
		mds = metadata.PlateauProjects()
	} else {
		mds = metadata.FindDataCatalogAndSub(project)
	}

	if err := h.prepareAll(ctx, mds); err != nil {
		log.Errorfc(ctx, "failed to prepare repos: %v", err)
	}

	repos := make([]plateauapi.Repo, 0, len(mds))
	for _, s := range mds {
		if r := h.getRepo(s); r != nil {
			repos = append(repos, r)
		}
	}

	if len(repos) == 0 {
		return nil
	}

	if len(repos) == 1 {
		return repos[0]
	}

	merged := plateauapi.NewMerger(repos...)
	if err := merged.Init(ctx); err != nil {
		log.Errorfc(ctx, "datacatalogv3: failed to initialize merged repo: %v", err)
		return nil
	}

	return merged
}

func (h *reposHandler) getRepo(md plateaucms.Metadata) (repo plateauapi.Repo) {
	if md.DataCatalogProjectAlias == "" {
		return
	}

	if isV2(md) {
		repo = h.reposv2.Repo(md.DataCatalogProjectAlias)
	} else if isV3(md) {
		repo = h.reposv3.Repo(md.DataCatalogProjectAlias)
	}
	return
}

func (h *reposHandler) prepareAll(ctx context.Context, metadata plateaucms.MetadataList) error {
	errg, ctx := errgroup.WithContext(ctx)
	for _, md := range metadata {
		md := md

		errg.Go(func() error {
			if err := h.prepare(ctx, md); err != nil {
				return fmt.Errorf("failed to prepare repo for %s: %w", md.DataCatalogProjectAlias, err)
			}
			return nil
		})
	}
	return errg.Wait()
}

func (h *reposHandler) prepare(ctx context.Context, md plateaucms.Metadata) error {
	if isV2(md) {
		return h.prepareV2(ctx, md)
	}
	return h.prepareV3(ctx, md)
}

func (h *reposHandler) prepareV2(ctx context.Context, md plateaucms.Metadata) error {
	if !isV2(md) {
		return nil
	}

	f, err := newFetcherV2(md)
	if err != nil {
		return err
	}

	if err := h.reposv2.Prepare(ctx, f); err != nil {
		return fmt.Errorf("failed to prepare v2 repo for %s: %w", md.DataCatalogProjectAlias, err)
	}

	return nil
}

func (h *reposHandler) prepareV3(ctx context.Context, md plateaucms.Metadata) error {
	if !isV3(md) {
		return nil
	}

	cms, err := md.CMS()
	if err != nil {
		return fmt.Errorf("datacatalogv3: failed to create cms for %s: %w", md.DataCatalogProjectAlias, err)
	}

	if err := h.reposv3.Prepare(ctx, md.DataCatalogProjectAlias, md.PlateauYear(), md.IsPlateau(), cms); err != nil {
		return fmt.Errorf("failed to prepare v3 repo for %s: %w", md.DataCatalogProjectAlias, err)
	}

	return nil
}

func (h *reposHandler) updateV2(ctx context.Context, prj string) error {
	if _, err := h.reposv2.Update(ctx, prj); err != nil {
		return fmt.Errorf("datacatalogv2: failed to update repo %s: %w", prj, err)
	}
	return nil
}

func (h *reposHandler) updateV3(ctx context.Context, prj string) error {
	if _, err := h.reposv3.Update(ctx, prj); err != nil {
		return fmt.Errorf("datacatalogv3: failed to update repo %s: %w", prj, err)
	}
	return nil
}

func isV2(md plateaucms.Metadata) bool {
	return md.DataCatalogSchemaVersion == "" || md.DataCatalogSchemaVersion == cmsSchemaVersionV2
}

func isV3(md plateaucms.Metadata) bool {
	return md.DataCatalogSchemaVersion == cmsSchemaVersion
}

func adminContext(c echo.Context, bypassAdminRemoval, includeBeta, includeAlpha bool) {
	ctx := c.Request().Context()
	ctx = datacatalogv3.AdminContext(ctx, bypassAdminRemoval, includeBeta, includeAlpha)
	c.SetRequest(c.Request().WithContext(ctx))
}

func newFetcherV2(md plateaucms.Metadata) (*datacatalogv2adapter.Fetcher, error) {
	c, err := md.CMS()
	if err != nil {
		return nil, fmt.Errorf("datacatalogv2: failed to create cms for %s: %w", md.DataCatalogProjectAlias, err)
	}

	baseFetcher, err := datacatalogv2.NewFetcher(md.CMSBaseURL)
	if err != nil {
		return nil, fmt.Errorf("datacatalogv2: failed to create fetcher %s: %w", md.DataCatalogProjectAlias, err)
	}

	opts := datacatalogv2.FetcherDoOptions{}
	// if md.Name != "" {
	// 	opts.Subproject = md.SubPorjectAlias
	// 	opts.CityName = md.Name
	// }

	fetcher := datacatalogv2adapter.NewFetcher(baseFetcher, c, md.DataCatalogProjectAlias, opts)

	return fetcher, nil
}

func isAlpha(c echo.Context) bool {
	return c.Request().URL.Query().Has("alpha")
}

type cityGMLFileFilterFunc func(CityGMLFile) bool

func boundsCityGMLFileFilter(bounds []geo.Bounds2) cityGMLFileFilterFunc {
	return func(f CityGMLFile) bool {
		m, _ := jisx0410.Parse(f.MeshCode)
		for _, b := range bounds {
			if m.Bounds.IsIntersect(b) {
				return true
			}
		}
		return false
	}
}

func levelCityGMLFileFilter(level int, bounds []geo.Bounds2) cityGMLFileFilterFunc {
	return func(f CityGMLFile) bool {
		m, _ := jisx0410.Parse(f.MeshCode)
		if level == 2 && m.Level != 2 {
			return false
		}
		if level == 3 && m.Level < 3 {
			return false
		}
		for _, b := range bounds {
			if m.Bounds.IsIntersect(b) {
				return true
			}
		}
		return false
	}
}

package tiles

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/k0kubun/pp/v3"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

type Config struct {
	CMS          plateaucms.Config
	CacheControl string
}

type Handler struct {
	pcms  *plateaucms.CMS
	http  *http.Client
	lock  sync.RWMutex
	tiles map[string]map[string]string
	conf  Config
}

func New(conf Config) (*Handler, error) {
	pcms, err := plateaucms.New(conf.CMS)
	if err != nil {
		return nil, fmt.Errorf("failed to create plateau cms: %w", err)
	}

	return &Handler{
		pcms: pcms,
		conf: conf,
		http: &http.Client{
			Timeout: 10 * time.Second,
		},
	}, nil
}

func (h *Handler) Init(ctx context.Context) {
	h.lock.Lock()
	defer h.lock.Unlock()

	tiles, err := initTiles(ctx, h.pcms)
	if err != nil {
		log.Errorfc(ctx, "tiles: failed to init tiles: %v", err)
		return
	}

	h.tiles = tiles
	pp.Default.SetColoringEnabled(false)
	log.Debugfc(ctx, "tiles: initialized: %s", pp.Sprint(h.tiles))
}

func (h *Handler) Route(g *echo.Group) {
	g.GET("/tiles/:id/:z/:x/:y", h.GetTile)
	g.POST("/tiles/update", h.UpdateCache)
}

func (h *Handler) UpdateCache(c echo.Context) error {
	ctx := c.Request().Context()
	h.Init(ctx)
	return c.String(http.StatusOK, "ok")
}

func (h *Handler) GetTile(c echo.Context) error {
	id := c.Param("id")
	z := c.Param("z")
	x := c.Param("x")
	y := c.Param("y")

	tileURL := h.getTileURL(id, z)
	if tileURL == "" {
		return c.NoContent(http.StatusNotFound)
	}

	return h.streamTile(c, tileURL, z, x, y)
}

func (h *Handler) getTileURL(tile, z string) string {
	if h.tiles == nil {
		return ""
	}

	h.lock.RLock()
	defer h.lock.RUnlock()

	if _, ok := h.tiles[tile]; !ok {
		return ""
	}

	if url, ok := h.tiles[tile][z]; ok {
		return url
	}

	return ""
}

func (h *Handler) streamTile(c echo.Context, base, z, x, y string) error {
	url, err := url.JoinPath(base, z, x, y)
	if err != nil {
		return fmt.Errorf("failed to join url: %w", err)
	}

	resp, err := h.http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to get tile: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Debugfc(c.Request().Context(), "tiles: failed to get tile (status code %d): %s", resp.StatusCode, url)
	}

	for k, v := range resp.Header {
		for _, vv := range v {
			c.Response().Header().Set(k, vv)
		}
	}

	if h.conf.CacheControl != "" {
		c.Response().Header().Set("Cache-Control", h.conf.CacheControl)
	} else if h := resp.Header.Get("Cache-Control"); h != "" {
		c.Response().Header().Set("Cache-Control", h)
	}

	return c.Stream(resp.StatusCode, resp.Header.Get("Content-Type"), resp.Body)
}

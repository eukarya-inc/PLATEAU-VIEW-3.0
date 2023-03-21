package datacatalog

import (
	"runtime/debug"
	"time"

	"github.com/c2h5oh/datasize"
	"github.com/coocood/freecache"
	cache "github.com/gitsight/go-echo-cache"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

var defaultCacheSize = datasize.MustParseString("100 mb")
var defaultCacheTTL = 3

func cacheMiddleware(cfg Config) echo.MiddlewareFunc {
	if cfg.Cache {
		return func(next echo.HandlerFunc) echo.HandlerFunc {
			return next
		}
	}

	if cfg.CacheTTL <= 0 {
		cfg.CacheTTL = defaultCacheTTL
	}

	var v datasize.ByteSize
	if err := v.UnmarshalText([]byte(cfg.CacheSize)); err != nil {
		v = defaultCacheSize
	}

	if p := cfg.CacheGCPacent; p >= 0 {
		debug.SetGCPercent(p)
	}

	log.Infof("datacatalog: cache enabled: size=%v, ttl=%ds, GCpacent=%d", v.HumanReadable(), cfg.CacheTTL, cfg.CacheGCPacent)

	c := freecache.NewCache(int(v.Bytes()))
	return cache.New(&cache.Config{
		TTL: time.Duration(int64(time.Second) * int64(cfg.CacheTTL)),
	}, c)
}

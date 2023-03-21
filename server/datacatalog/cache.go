package datacatalog

import (
	"runtime/debug"
	"time"

	cache "github.com/SporkHubr/echo-http-cache"
	"github.com/SporkHubr/echo-http-cache/adapter/memory"
	"github.com/c2h5oh/datasize"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

var defaultCacheSize = datasize.MustParseString("20 mb")
var defaultCacheTTL = 3 * 60

func cacheMiddleware(cfg Config) (echo.MiddlewareFunc, error) {
	if cfg.DisableCache {
		return func(next echo.HandlerFunc) echo.HandlerFunc {
			return next
		}, nil
	}

	if cfg.CacheTTL <= 0 {
		cfg.CacheTTL = defaultCacheTTL
	}
	ttl := time.Duration(cfg.CacheTTL) * time.Second

	var size datasize.ByteSize
	if cfg.CacheSize != "" {
		if err := size.UnmarshalText([]byte(cfg.CacheSize)); err != nil {
			size = defaultCacheSize
		}
	} else {
		size = defaultCacheSize
	}

	memcached, err := memory.NewAdapter(
		memory.AdapterWithAlgorithm(memory.LRU),
		memory.AdapterWithCapacity(int(size.Bytes())),
	)
	if err != nil {
		return nil, err
	}

	cacheClient, err := cache.NewClient(
		cache.ClientWithAdapter(memcached),
		cache.ClientWithTTL(ttl),
	)
	if err != nil {
		return nil, err
	}

	if cfg.CacheGCParcent > 0 {
		debug.SetGCPercent(cfg.CacheGCParcent)
	} else {
		cfg.CacheGCParcent = 100
	}

	log.Infof("datacatalog: cache enabled: size=%s, ttl=%ds, gcparcent=%d", size.HumanReadable(), cfg.CacheTTL, cfg.CacheGCParcent)

	return cacheClient.Middleware(), nil
}

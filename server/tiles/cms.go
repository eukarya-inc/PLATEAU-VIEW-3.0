package tiles

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"strconv"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
)

const modelKey = "tiles"

func initTiles(ctx context.Context, pcms *plateaucms.CMS) (map[string]map[string]string, error) {
	ml, err := pcms.AllMetadata(ctx, false)
	if err != nil {
		return nil, fmt.Errorf("failed to get all metadata: %w", err)
	}

	tiles := map[string]map[string]string{}
	for _, m := range ml {
		prj := m.DataCatalogProjectAlias
		if prj == "" {
			prj = m.ProjectAlias
		}
		if prj == "" {
			continue
		}

		cms, err := m.CMS()
		if err != nil {
			continue
		}

		tiles2, err := getTiles(ctx, cms, prj)
		if err != nil {
			return nil, fmt.Errorf("failed to get tiles from %s: %w", prj, err)
		}

		for k, v := range tiles2 {
			tiles[k] = v
		}
	}

	return tiles, nil
}

func getTiles(ctx context.Context, c cms.Interface, prj string) (map[string]map[string]string, error) {
	items, err := c.GetItemsByKeyInParallel(ctx, prj, modelKey, true, 0)
	if err != nil {
		return nil, nil
	}

	res := map[string]map[string]string{}

	for _, item := range items.Items {
		name := lo.FromPtr(item.FieldByKey("name").GetValue().String())
		if name == "" {
			continue
		}

		assetsRaw, _ := item.FieldByKey("assets").Value.([]any)
		urls := map[string]string{}
		for _, assetRaw := range assetsRaw {
			asset := cms.PublicAssetFrom(assetRaw)
			if asset == nil {
				continue
			}

			z := extractZ(asset.URL)
			for _, z := range z {
				if u := assetBaseURL(asset.URL); u != "" {
					urls[z] = u
				}
			}
		}

		if len(urls) == 0 {
			continue
		}

		res[name] = urls
	}

	return res, nil
}

func assetBaseURL(zipURL string) string {
	u, err := url.Parse(zipURL)
	if err != nil {
		return ""
	}

	u.Path = strings.TrimSuffix(u.Path, path.Ext(u.Path))
	return u.String()
}

func extractZ(name string) (res []string) {
	// hogehoge_z0.zip -> [0]
	// hogehoge_z10-12.zip -> [10, 11, 12]
	name = strings.TrimSuffix(path.Base(name), path.Ext(name))
	parts := strings.Split(name, "_")
	for _, part := range parts {
		if !strings.HasPrefix(part, "z") {
			continue
		}

		part = strings.TrimPrefix(part, "z")
		if strings.Contains(part, "-") {
			zRange := strings.Split(part, "-")
			if len(zRange) != 2 {
				continue
			}

			start, _ := strconv.Atoi(zRange[0])
			end, _ := strconv.Atoi(zRange[1])
			if start > end {
				continue
			}

			for i := start; i <= end; i++ {
				res = append(res, strconv.Itoa(i))
			}

			continue
		}

		_, err := strconv.Atoi(part)
		if err != nil {
			continue
		}

		res = append(res, part)
	}

	return res
}

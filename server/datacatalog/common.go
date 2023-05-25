package datacatalog

import (
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/jpareacode"
)

type Config struct {
	CMSBase      string
	DisableCache bool
	CacheTTL     int
}

func assetURLFromFormat(u, f string) string {
	u2, err := url.Parse(u)
	if err != nil {
		return u
	}

	dir := path.Dir(u2.Path)
	ext := path.Ext(u2.Path)
	base := path.Base(u2.Path)
	name := strings.TrimSuffix(base, ext)
	isArchive := ext == ".zip" || ext == ".7z"

	u2.Path = assetRootPath(u2.Path)
	if f == "3dtiles" {
		if !isArchive {
			// not CMS asset
			return u
		}

		u2.Path = path.Join(u2.Path, "tileset.json")
		return u2.String()
	} else if f == "tiles" || f == "mvt" {
		us := ""
		if !isArchive {
			// not CMS asset
			us = u
		} else {
			ext := ""
			if f == "mvt" {
				ext = "mvt"
			} else {
				ext = "png"
			}

			u2.Path = path.Join(u2.Path, "{z}/{x}/{y}."+ext)
			us = u2.String()
		}

		return strings.ReplaceAll(strings.ReplaceAll(us, "%7B", "{"), "%7D", "}")
	} else if f == "tms" {
		if !isArchive {
			// not CMS asset
			return u
		}
		return u2.String()
	} else if (f == "czml" || f == "kml") && isArchive {
		u2.Path = path.Join(dir, name, fmt.Sprintf("%s.%s", name, f))
		return u2.String()
	}
	return u
}

func assetRootPath(p string) string {
	fn := strings.TrimSuffix(path.Base(p), path.Ext(p))
	return path.Join(path.Dir(p), fn)
}

func normalizePref(pref string) (string, int) {
	if pref == "全球" || pref == "全国" {
		pref = "全球データ"
	}

	var prefCode int
	if pref == "全球データ" {
		prefCode = 0
	} else {
		prefCode = jpareacode.PrefectureCodeInt(pref)
	}

	return pref, prefCode
}

func cityCode(code, name string, prefCode int) string {
	if code == "" {
		cityName := strings.Split(name, "/")
		if len(cityName) > 0 {
			if city := jpareacode.CityByName(prefCode, cityName[len(cityName)-1]); city != nil {
				code = jpareacode.FormatCityCode(city.Code)
			}
		}
	}
	return code
}

func isLayerSupported(format string) bool {
	switch format {
	case "mvt", "wms":
		return true
	}
	return false
}

package datacatalog

import (
	"net/url"
	"path"
	"strings"

	"github.com/samber/lo"
)

type DataCatalogItem struct {
	ID                string `json:"id,omitempty"`
	Name              string `json:"name,omitempty"`
	Prefecture        string `json:"pref,omitempty"`
	City              string `json:"city,omitempty"`
	CityEn            string `json:"city_en,omitempty"`
	CityCode          string `json:"city_code,omitempty"`
	Ward              string `json:"ward,omitempty"`
	WardEn            string `json:"ward_en,omitempty"`
	WardCode          string `json:"ward_code,omitempty"`
	Type              string `json:"type,omitempty"`
	TypeEn            string `json:"type_en,omitempty"`
	Format            string `json:"format,omitempty"`
	Layers            string `json:"layers,omitempty"`
	URL               string `json:"url,omitempty"`
	BldgLowTextureURL string `json:"bldg_low_texture_url,omitempty"`
	BldgNoTextureURL  string `json:"bldg_no_texture_url,omitempty"`
	Description       string `json:"desc,omitempty"`
	SearchIndex       string `json:"search_index,omitempty"`
	Year              int    `json:"year,omitempty"`
	Config            any    `json:"config,omitempty"`
}

type DataCatalogGroup struct {
	ID         string `json:"id,omitempty"`
	Name       string `json:"name,omitempty"`
	Prefecture string `json:"pref,omitempty"`
	City       string `json:"city,omitempty"`
	CityEn     string `json:"cityEn,omitempty"`
	Type       string `json:"type,omitempty"`
	Children   []any  `json:"children"`
}

type ResponseAll struct {
	Plateau []PlateauItem
	Usecase []UsecaseItem
}

func (d ResponseAll) All() []DataCatalogItem {
	return append(d.plateau(), d.usecase()...)
}

func (d ResponseAll) ByCities() []DataCatalogGroup {
	// r := d.All()
	// TODO
	return nil
}

func (d ResponseAll) ByTypes() []DataCatalogGroup {
	// r := d.All()
	// TODO
	return nil
}

func (d ResponseAll) plateau() []DataCatalogItem {
	return lo.FlatMap(d.Plateau, func(i PlateauItem, _ int) []DataCatalogItem {
		return i.DataCatalogs()
	})
}

func (d ResponseAll) usecase() []DataCatalogItem {
	return lo.FlatMap(d.Usecase, func(i UsecaseItem, _ int) []DataCatalogItem {
		return i.DataCatalogs()
	})
}

func assetURLFromFormat(u, f string) string {
	u2, err := url.Parse(u)
	if err != nil {
		return u
	}

	isCMS := path.Ext(u2.Path) == ".zip" || path.Ext(u2.Path) == ".7z"
	u2.Path = assetRootPath(u2.Path)
	if f == "3dtiles" {
		if !isCMS {
			// not CMS asset
			return u
		}

		u2.Path = path.Join(u2.Path, "tileset.json")
		return u2.String()
	} else if f == "mvt" {
		us := ""
		if !isCMS {
			// not CMS asset
			us = u
		} else {
			u2.Path = path.Join(u2.Path, "{z}/{x}/{y}.mvt")
			us = u2.String()
		}

		return strings.ReplaceAll(strings.ReplaceAll(us, "%7B", "{"), "%7D", "}")
	}
	return u
}

func assetRootPath(p string) string {
	fn := strings.TrimSuffix(path.Base(p), path.Ext(p))
	return path.Join(path.Dir(p), fn)
}

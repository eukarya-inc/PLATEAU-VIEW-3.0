package datacatalog

import (
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauv2"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type DataCatalogItem struct {
	ID          string   `json:"id,omitempty"`
	ItemID      string   `json:"itemId,omitempty"`
	Name        string   `json:"name,omitempty"`
	Pref        string   `json:"pref,omitempty"`
	PrefCode    string   `json:"pref_code,omitempty"`
	City        string   `json:"city,omitempty"`
	CityEn      string   `json:"city_en,omitempty"`
	CityCode    string   `json:"city_code,omitempty"`
	Ward        string   `json:"ward,omitempty"`
	WardEn      string   `json:"ward_en,omitempty"`
	WardCode    string   `json:"ward_code,omitempty"`
	Type        string   `json:"type,omitempty"`
	Type2       string   `json:"type2,omitempty"`
	TypeEn      string   `json:"type_en,omitempty"`
	Type2En     string   `json:"type2_en,omitempty"`
	Format      string   `json:"format,omitempty"`
	Layers      []string `json:"layers,omitempty"`
	URL         string   `json:"url,omitempty"`
	Description string   `json:"desc,omitempty"`
	SearchIndex string   `json:"search_index,omitempty"`
	Year        int      `json:"year,omitempty"`
	OpenDataURL string   `json:"openDataUrl,omitempty"`
	Config      any      `json:"config,omitempty"`
	Order       *int     `json:"order,omitempty"`
	Root        bool     `json:"root,omitempty"`
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
	Plateau []plateauv2.CMSItem
	Usecase []UsecaseItem
}

func (d ResponseAll) All() []DataCatalogItem {
	return append(d.plateau(), d.usecase()...)
}

func (d ResponseAll) plateau() []DataCatalogItem {
	m := map[string]int{}

	return lo.Filter(lo.FlatMap(d.Plateau, func(i plateauv2.CMSItem, _ int) []DataCatalogItem {
		c := i.IntermediateItem()
		if c.Year == 0 {
			return nil
		}
		if y, ok := m[c.CityCode]; ok && y >= c.Year {
			return nil
		}
		m[c.CityCode] = c.Year
		return util.Map(i.AllDataCatalogItems(c), DataCatalogItemFromPlateauV2)
	}), func(i DataCatalogItem, _ int) bool {
		y, ok := m[i.CityCode]
		return ok && y == i.Year
	})
}

func (d ResponseAll) usecase() []DataCatalogItem {
	return lo.FlatMap(d.Usecase, func(i UsecaseItem, _ int) []DataCatalogItem {
		return i.DataCatalogs()
	})
}

func DataCatalogItemFromPlateauV2(i plateauv2.DataCatalogItem) DataCatalogItem {
	return DataCatalogItem(i)
}

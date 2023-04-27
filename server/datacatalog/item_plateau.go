package datacatalog

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type PlateauItem struct {
	ID              string             `json:"id"`
	Prefecture      string             `json:"prefecture"`
	CityName        string             `json:"city_name"`
	Specification   string             `json:"specification"`
	CityGML         *cms.PublicAsset   `json:"citygml"`
	DescriptionBldg string             `json:"description_bldg"`
	DescriptionTran string             `json:"description_tran"`
	DescriptionFrn  string             `json:"description_frn"`
	DescriptionVeg  string             `json:"description_veg"`
	DescriptionLuse string             `json:"description_luse"`
	DescriptionLsld string             `json:"description_lsld"`
	DescriptionUrf  []string           `json:"description_urf"`
	DescriptionFld  []string           `json:"description_fld"`
	DescriptionHtd  []string           `json:"description_htd"`
	DescriptionIfld []string           `json:"description_ifld"`
	DescriptionTnm  []string           `json:"description_tnm"`
	DescriptionBrid string             `json:"description_brid"`
	DescriptionRail string             `json:"description_rail"`
	DescriptionGen  []string           `json:"description_gen"`
	Bldg            []*cms.PublicAsset `json:"bldg"`
	Tran            []*cms.PublicAsset `json:"tran"`
	Frn             []*cms.PublicAsset `json:"frn"`
	Veg             []*cms.PublicAsset `json:"veg"`
	Luse            []*cms.PublicAsset `json:"luse"`
	Lsld            []*cms.PublicAsset `json:"lsld"`
	Urf             []*cms.PublicAsset `json:"urf"`
	Fld             []*cms.PublicAsset `json:"fld"`
	Htd             []*cms.PublicAsset `json:"htd"`
	Ifld            []*cms.PublicAsset `json:"ifld"`
	Tnm             []*cms.PublicAsset `json:"tnm"`
	Brid            []*cms.PublicAsset `json:"brid"`
	Rail            []*cms.PublicAsset `json:"rail"`
	Gen             []*cms.PublicAsset `json:"gen"`
	Dictionary      *cms.PublicAsset   `json:"dictionary"`
	Dic             string             `json:"dic"`
	SearchIndex     []*cms.PublicAsset `json:"search_index"`
	OpenDataURL     string             `json:"opendata_url"`
}

func (i PlateauItem) LuseItem(c PlateauIntermediateItem) *DataCatalogItem {
	if i.Luse == nil {
		return nil
	}

	a := i.Luse[0]
	return c.DataCatalogItem("土地利用モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionLuse, []string{"luse"}, false, "")
}

func (i PlateauItem) LsldItem(c PlateauIntermediateItem) *DataCatalogItem {
	if i.Lsld == nil {
		return nil
	}

	a := i.Lsld[0]
	return c.DataCatalogItem("土砂災害警戒区域モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionLsld, []string{"lsld"}, false, "")
}

func (i PlateauItem) UrfItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Urf) == 0 {
		return nil
	}

	return lo.Map(i.Urf, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)

		name, desc := descFromAsset(a, i.DescriptionUrf)
		return c.DataCatalogItem("都市計画決定情報モデル", an, a.URL, desc, urfLayers(an.UrfFeatureType), false, name)
	})
}

func (i PlateauItem) HtdItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Htd) == 0 {
		return nil
	}

	return lo.Map(i.Htd, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)

		_, desc := descFromAsset(a, i.DescriptionHtd)
		dci := c.DataCatalogItem("高潮浸水想定区域モデル", an, a.URL, desc, nil, false, "")

		if dci != nil {
			dci.Name = htdTnmIfldName("高潮浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Htd(an.FldName))
		}
		return dci
	})
}

func (i PlateauItem) IfldItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Ifld) == 0 {
		return nil
	}

	return lo.Map(i.Ifld, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)

		_, desc := descFromAsset(a, i.DescriptionIfld)
		dci := c.DataCatalogItem("内水浸水想定区域モデル", an, a.URL, desc, nil, false, "")

		if dci != nil {
			dci.Name = htdTnmIfldName("内水浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Ifld(an.FldName))
		}
		return dci
	})
}

func (i PlateauItem) TnmItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Tnm) == 0 {
		return nil
	}

	return lo.Map(i.Tnm, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)

		_, desc := descFromAsset(a, i.DescriptionTnm)
		dci := c.DataCatalogItem("津波浸水想定区域モデル", an, a.URL, desc, nil, false, "")

		if dci != nil {
			dci.Name = htdTnmIfldName("津波浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Tnm(an.FldName))
		}
		return dci
	})
}

func (i PlateauItem) DataCatalogItems(c PlateauIntermediateItem) []DataCatalogItem {
	if c.ID == "" {
		return nil
	}

	return util.DerefSlice(lo.Filter(
		append(append(append(append(append(append(append(append(append(
			i.BldgItems(c),
			i.TranItem(c),
			i.FrnItem(c),
			i.VegItem(c),
			i.LuseItem(c),
			i.LsldItem(c)),
			i.UrfItems(c)...),
			i.FldItems(c)...),
			i.TnmItems(c)...),
			i.HtdItems(c)...),
			i.IfldItems(c)...),
			i.BridItem(c)),
			i.RailItem(c)),
			i.GenItems(c)...,
		),
		func(i *DataCatalogItem, _ int) bool {
			return i != nil
		},
	))
}

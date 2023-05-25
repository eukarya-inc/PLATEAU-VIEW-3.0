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

func (i PlateauItem) Feature(ty string) []*cms.PublicAsset {
	switch ty {
	case "bldg":
		return i.Bldg
	case "tran":
		return i.Tran
	case "frn":
		return i.Frn
	case "veg":
		return i.Veg
	case "luse":
		return i.Luse
	case "lsld":
		return i.Lsld
	case "urf":
		return i.Urf
	case "fld":
		return i.Fld
	case "htd":
		return i.Htd
	case "ifld":
		return i.Ifld
	case "tnm":
		return i.Tnm
	case "brid":
		return i.Brid
	case "rail":
		return i.Rail
	case "gen":
		return i.Gen
	}
	return nil
}

func (i PlateauItem) FeatureDescription(ty string) []string {
	switch ty {
	case "bldg":
		return []string{i.DescriptionBldg}
	case "tran":
		return []string{i.DescriptionTran}
	case "frn":
		return []string{i.DescriptionFrn}
	case "veg":
		return []string{i.DescriptionVeg}
	case "luse":
		return []string{i.DescriptionLuse}
	case "lsld":
		return []string{i.DescriptionLsld}
	case "urf":
		return i.DescriptionUrf
	case "fld":
		return i.DescriptionFld
	case "htd":
		return i.DescriptionHtd
	case "ifld":
		return i.DescriptionIfld
	case "tnm":
		return i.DescriptionTnm
	case "brid":
		return []string{i.DescriptionBrid}
	case "rail":
		return []string{i.DescriptionRail}
	case "gen":
		return i.DescriptionGen
	}
	return nil
}

func (i PlateauItem) AllDataCatalogItems(c PlateauIntermediateItem) []DataCatalogItem {
	if c.ID == "" {
		return nil
	}

	return util.DerefSlice(lo.Filter(
		lo.FlatMap(FeatureTypes, func(ty string, _ int) []*DataCatalogItem {
			return i.DataCatalogItems(c, ty)
		}),
		func(i *DataCatalogItem, _ int) bool {
			return i != nil
		},
	))
}

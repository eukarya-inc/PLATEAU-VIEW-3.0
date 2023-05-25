package datacatalog

import (
	"fmt"

	"golang.org/x/exp/slices"
)

var FeatureTypes = []string{
	"bldg",
	"tran",
	"frn",
	"veg",
	"luse",
	"lsld",
	"urf",
	"fld",
	"tnm",
	"htd",
	"ifld",
	"brid",
	"rail",
	"gen",
}

func (i PlateauItem) DataCatalogItems(c PlateauIntermediateItem, ty string) []*DataCatalogItem {
	o, ok := FeatureOptions[ty]
	if !ok {
		return nil
	}

	return DataCatalogItemBuilder{
		Assets:           i.Feature(ty),
		Descriptions:     i.FeatureDescription(ty),
		SearchIndex:      i.SearchIndex,
		IntermediateItem: c,
		Options:          o,
	}.Build()
}

var FeatureOptions = map[string]DataCatalogItemBuilderOption{
	"bldg": {
		ModelName:          "建築物モデル",
		LOD:                true,
		UseMaxLODAsDefault: true,
		ItemID:             true,
		GroupBy: func(an AssetName) string {
			return an.WardEn
		},
		SortGroupBy: func(a, b AssetName) bool {
			return a.WardCodeInt() < b.WardCodeInt()
		},
		SearchIndex: true,
	},
	"tran": {
		ModelName: "道路モデル",
		LOD:       true,
		LayersForLOD: map[string][]string{
			"0": {"Road"},
			"1": {"Road"},
			"2": {"TrafficArea", "AuxiliaryTrafficArea"},
		},
		UseMaxLODAsDefault: true,
	},
	"frn": {
		ModelName: "都市設備モデル",
		LOD:       true,
	},
	"veg": {
		ModelName: "植生モデル",
		LOD:       true,
	},
	"luse": {
		ModelName: "土地利用モデル",
		Layers:    []string{"luse"},
	},
	"lsld": {
		ModelName: "土砂災害警戒区域モデル",
		Layers:    []string{"lsld"},
	},
	"urf": {
		ModelName:           "都市計画決定情報モデル",
		UseGroupNameAsLayer: true,
		MultipleDesc:        true,
		GroupBy: func(an AssetName) string {
			return normalizeUrfFeatureType(an.UrfFeatureType)
		},
		SortGroupBy: func(c, d AssetName) bool {
			i1 := slices.Index(urfFeatureTypes, normalizeUrfFeatureType(c.UrfFeatureType))
			if i1 < 0 {
				i1 = len(urfFeatureTypes)
			}
			i2 := slices.Index(urfFeatureTypes, normalizeUrfFeatureType(d.UrfFeatureType))
			if i2 < 0 {
				i2 = len(urfFeatureTypes)
			}
			return i1 < i2
		},
		Name: func(an AssetName) (string, string, string) {
			ft := normalizeUrfFeatureType(an.UrfFeatureType)
			if urfName := urfFeatureTypeMap[ft]; urfName != "" {
				return fmt.Sprintf("%sモデル", urfName), urfName, ft
			}
			return ft, ft, ft
		},
	},
	"fld": {
		ModelName:    "洪水浸水想定区域モデル",
		MultipleDesc: true,
		GroupBy: func(an AssetName) string {
			return an.FldAdminAndName()
		},
		SortGroupBy: func(a, b AssetName) bool {
			return a.FldName < b.FldName || a.FldAdmin < b.FldAdmin
		},
		SortAssetBy: func(a, b AssetName) bool {
			return a.FldScale < b.FldScale
		},
		SubName: func(an AssetName, dic Dic) string {
			if e := dic.Fld(an.FldNameAndScale(), an.FldAdmin); e != nil {
				return fmt.Sprintf("%s（%s管理区間）", e.Description, e.Admin)
			}
			return an.FldAdminAndName()
		},
		ItemName: func(an AssetName, dic Dic, _, _ int) string {
			name := an.FldScale
			if e := dic.Fld(an.FldNameAndScale(), an.FldAdmin); e != nil {
				name = e.Scale
			}
			return name
		},
	},
	"tnm": {
		ModelName:    "津波浸水想定区域モデル",
		MultipleDesc: true,
		GroupBy: func(an AssetName) string {
			return an.FldName
		},
		SubName: func(an AssetName, dic Dic) string {
			if e := dic.FindByName("tnm", an.FldName); e != nil {
				return e.Description
			}
			return an.FldName
		},
	},
	"htd": {
		ModelName:    "高潮浸水想定区域モデル",
		MultipleDesc: true,
		GroupBy: func(an AssetName) string {
			return an.FldName
		},
		SubName: func(an AssetName, dic Dic) string {
			if e := dic.FindByName("htd", an.FldName); e != nil {
				return e.Description
			}
			return an.FldName
		},
	},
	"ifld": {
		ModelName:    "内水浸水想定区域モデル",
		MultipleDesc: true,
		GroupBy: func(an AssetName) string {
			return an.FldName
		},
		SubName: func(an AssetName, dic Dic) string {
			if e := dic.FindByName("ifld", an.FldName); e != nil {
				return e.Description
			}
			return an.FldName
		},
	},
	"brid": {
		ModelName: "橋梁モデル",
		LOD:       true,
		Layers:    []string{"brid"},
	},
	"rail": {
		ModelName: "鉄道モデル",
		LOD:       true,
		Layers:    []string{"rail"},
	},
	"gen": {
		ModelName:           "汎用都市オブジェクトモデル",
		MultipleDesc:        true,
		LOD:                 true,
		UseGroupNameAsName:  true,
		UseGroupNameAsLayer: true,
		GroupBy: func(n AssetName) string {
			return n.GenName
		},
	},
}

func normalizeUrfFeatureType(ft string) string {
	if ft == "WaterWay" {
		return "Waterway"
	}
	return ft
}

package plateauv2

import (
	"fmt"
	"sort"
	"strings"

	"github.com/samber/lo"
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
	"extra",
}

var FeatureOptions = map[string]DataCatalogItemBuilderOption{
	"bldg": {
		Type:               "建築物モデル",
		TypeEn:             "bldg",
		LOD:                true,
		UseMaxLODAsDefault: true,
		ItemID:             true,
		GroupBy: func(an AssetName, assets []AssetName) string {
			return an.WardEn
		},
		SortGroupBy: func(a, b AssetName) bool {
			return a.WardCodeInt() < b.WardCodeInt()
		},
		OmitGroupNameFromID: true,
		SearchIndex:         true,
	},
	"tran": {
		Type:               "道路モデル",
		TypeEn:             "tran",
		LOD:                true,
		UseMaxLODAsDefault: true,
		Group: func(ctx ItemContext) Override {
			return Override{
				Layers: tranLayersForLOD[ctx.AssetName.LOD],
			}
		},
		Item: func(ctx ItemContext) ItemOverride {
			return ItemOverride{
				Layers: tranLayersForLOD[ctx.AssetName.LOD],
			}
		},
	},
	"frn": {
		Type:   "都市設備モデル",
		TypeEn: "frn",
		LOD:    true,
	},
	"veg": {
		Type:   "植生モデル",
		TypeEn: "veg",
		LOD:    true,
	},
	"luse": {
		Type:   "土地利用モデル",
		TypeEn: "luse",
		Layers: []string{"luse"},
	},
	"lsld": {
		Type:   "土砂災害警戒区域モデル",
		TypeEn: "lsld",
		Layers: []string{"lsld"},
	},
	"urf": {
		Type:   "都市計画決定情報モデル",
		TypeEn: "urf",
		Group: func(ctx ItemContext) Override {
			var name, t2 string
			ft := normalizeUrfFeatureType(ctx.AssetName.UrfFeatureType)
			if urfName := urfFeatureTypeMap[ft]; urfName != "" {
				name = fmt.Sprintf("%sモデル", urfName)
				t2 = urfName
			} else {
				name = ft
				t2 = ft
			}
			return Override{
				Name:    name,
				Type2:   t2,
				Type2En: ft,
				Layers:  []string{ctx.GroupName},
			}
		},
		MultipleDesc: true,
		GroupBy: func(an AssetName, assets []AssetName) string {
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
	},
	"fld": {
		Type:   "洪水浸水想定区域モデル",
		TypeEn: "fld",
		Group: func(ctx ItemContext) Override {
			subname := ""
			if ctx.DicEntry != nil {
				subname = fmt.Sprintf("%s（%s管理区間）", ctx.DicEntry.Description, ctx.DicEntry.Admin)
			} else {
				subname = ctx.AssetName.FldAdminAndName()
			}
			return Override{
				SubName: subname,
			}
		},
		Item: func(ctx ItemContext) ItemOverride {
			name := ctx.AssetName.FldScale
			if ctx.DicEntry != nil {
				name = ctx.DicEntry.Scale
			}

			return ItemOverride{
				Name: name,
			}
		},
		MultipleDesc: true,
		GroupBy: func(an AssetName, assets []AssetName) string {
			l := "l1"
			a := lo.Filter(assets, func(a AssetName, _ int) bool {
				return a.FldName == an.FldName && a.FldAdmin == an.FldAdmin
			})
			sort.SliceStable(a, func(i, j int) bool {
				return a[i].FldScale < a[j].FldScale
			})
			if len(a) > 0 {
				l = a[0].FldScale
			}

			return fmt.Sprintf("%s_%s", an.FldAdminAndName(), l) // for compat
		},
		SortGroupBy: func(a, b AssetName) bool {
			return a.FldAdminAndName() < b.FldAdminAndName()
		},
		SortAssetBy: func(a, b AssetName) bool {
			return a.FldScale < b.FldScale
		},
	},
	"tnm": {
		Type:   "津波浸水想定区域モデル",
		TypeEn: "tnm",
		Group: func(ctx ItemContext) Override {
			subname := ctx.AssetName.FldName
			if ctx.DicEntry != nil {
				subname = ctx.DicEntry.Description
			}
			return Override{
				SubName: subname,
			}
		},
		MultipleDesc: true,
		GroupBy: func(an AssetName, assets []AssetName) string {
			return an.FldName
		},
	},
	"htd": {
		Type:   "高潮浸水想定区域モデル",
		TypeEn: "htd",
		Group: func(ctx ItemContext) Override {
			subname := ctx.AssetName.FldName
			if ctx.DicEntry != nil {
				subname = ctx.DicEntry.Description
			}
			return Override{
				SubName: subname,
			}
		},
		MultipleDesc: true,
		GroupBy: func(an AssetName, assets []AssetName) string {
			return an.FldName
		},
	},
	"ifld": {
		Type:   "内水浸水想定区域モデル",
		TypeEn: "ifld",
		Group: func(ctx ItemContext) Override {
			subname := ctx.AssetName.FldName
			if ctx.DicEntry != nil {
				subname = ctx.DicEntry.Description
			}
			return Override{
				SubName: subname,
			}
		},
		MultipleDesc: true,
		GroupBy: func(an AssetName, assets []AssetName) string {
			return an.FldName
		},
	},
	"brid": {
		Type:   "橋梁モデル",
		TypeEn: "brid",
		Layers: []string{"brid"},
		LOD:    true,
	},
	"rail": {
		Type:   "鉄道モデル",
		TypeEn: "rail",
		Layers: []string{"rail"},
		LOD:    true,
	},
	"gen": {
		Type:         "汎用都市オブジェクトモデル",
		TypeEn:       "gen",
		MultipleDesc: true,
		LOD:          true,
		Group: func(ctx ItemContext) Override {
			return Override{
				Name:   ctx.GroupName,
				Layers: []string{ctx.GroupName},
			}
		},
		Item: func(ctx ItemContext) ItemOverride {
			name := ctx.Description.Override.Name
			if name == "" {
				name = ctx.GroupName
			}
			return ItemOverride{
				Name:   name,
				Layers: []string{ctx.GroupName},
			}
		},
		GroupBy: func(n AssetName, assets []AssetName) string {
			return n.GenName
		},
	},
	"extra": {
		Type:         "その他のデータセット",
		TypeEn:       "ex",
		MultipleDesc: true,
		LOD:          true,
		GroupBy: func(n AssetName, assets []AssetName) string {
			return strings.Join(n.FeatureEx, "-")
		},
	},
}

func normalizeUrfFeatureType(ft string) string {
	if ft == "WaterWay" {
		return "Waterway"
	}
	return ft
}

var tranLayersForLOD = map[string][]string{
	"0": {"Road"},
	"1": {"Road"},
	"2": {"TrafficArea", "AuxiliaryTrafficArea"},
}

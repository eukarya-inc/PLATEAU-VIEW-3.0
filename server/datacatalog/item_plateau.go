package datacatalog

import (
	"bytes"
	_ "embed"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/url"
	"path"
	"strconv"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/spkg/bom"
)

//go:embed urf.csv
var urfFeatureTypesData []byte
var urfFeatureTypes map[string]string

func init() {
	r := csv.NewReader(bom.NewReader(bytes.NewReader(urfFeatureTypesData)))
	d := lo.Must(r.ReadAll())
	urfFeatureTypes = lo.SliceToMap(d[1:], func(c []string) (string, string) {
		return c[0], c[1]
	})
}

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
	DescriptionLfld []string           `json:"description_lfld"`
	DescriptionTnm  []string           `json:"description_tnm"`
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
	Dictionary      *cms.PublicAsset   `json:"dictionary"`
	Dic             string             `json:"dic"`
	SearchIndex     []*cms.PublicAsset `json:"search_index"`
}

func (i PlateauItem) BldgItems(c PlateauIntermediateItem) []*DataCatalogItem {
	assets := assetsByWards(i.Bldg)
	if len(assets) == 0 {
		return nil
	}

	return lo.Filter(lo.MapToSlice(assets, func(k string, v []*cms.PublicAsset) *DataCatalogItem {
		s := maxLODBldg(v)
		if s == nil || s.Texture == nil {
			return nil
		}

		dci := c.DataCatalogItem("建築物モデル", AssetNameFrom(s.Texture.URL), s.Texture.URL, i.DescriptionBldg, nil)
		if s.LowTexture != nil {
			dci.BldgLowTextureURL = assetURLFromFormat(s.LowTexture.URL, "3dtiles")
		}
		if s.NoTexture != nil {
			dci.BldgNoTextureURL = assetURLFromFormat(s.NoTexture.URL, "3dtiles")
		}
		dci.SearchIndex = searchIndexURLFrom(i.SearchIndex, dci.WardCode)
		return dci
	}), func(a *DataCatalogItem, _ int) bool {
		return a != nil
	})
}

func (i PlateauItem) TranItem(c PlateauIntermediateItem) *DataCatalogItem {
	a, lod := maxLOD(i.Tran)
	if a == nil {
		return nil
	}

	// LOD1: Road（道路）, LOD2: TrafficArea（交通領域）, AuxiliaryTrafficArea（交通補助領域）
	var layers []string
	if lod == 2 {
		layers = []string{"TrafficArea", "AuxiliaryTrafficArea"}
	} else if lod == 1 {
		layers = []string{"Road"}
	}
	return c.DataCatalogItem("道路モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionTran, layers)
}

func (i PlateauItem) FrnItem(c PlateauIntermediateItem) *DataCatalogItem {
	if len(i.Frn) == 0 {
		return nil
	}

	a := i.Frn[0]
	return c.DataCatalogItem("都市設備モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionFrn, nil)
}

func (i PlateauItem) VegItem(c PlateauIntermediateItem) *DataCatalogItem {
	if len(i.Veg) == 0 {
		return nil
	}

	a := i.Veg[0]
	return c.DataCatalogItem("植生モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionVeg, nil)
}

func (i PlateauItem) LuseItem(c PlateauIntermediateItem) *DataCatalogItem {
	if i.Luse == nil {
		return nil
	}

	a := i.Luse[0]
	return c.DataCatalogItem("土地利用モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionLuse, []string{"luse"})
}

func (i PlateauItem) LsldItem(c PlateauIntermediateItem) *DataCatalogItem {
	if i.Lsld == nil {
		return nil
	}

	a := i.Lsld[0]
	return c.DataCatalogItem("土砂災害警戒区域モデル", AssetNameFrom(a.URL), a.URL, i.DescriptionLsld, []string{"lsld"})
}

func (i PlateauItem) UrfItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Urf) == 0 {
		return nil
	}

	return lo.Map(i.Urf, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)
		return c.DataCatalogItem("都市計画決定情報モデル", an, a.URL, descFromAsset(a, i.DescriptionUrf), []string{an.UrfFeatureType})
	})
}

func (i PlateauItem) FldItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Fld) == 0 {
		return nil
	}

	return lo.Map(i.Fld, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)
		dci := c.DataCatalogItem("洪水浸水想定区域モデル", an, a.URL, descFromAsset(a, i.DescriptionFld), nil)
		dci.Name = fldName("洪水浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Fld(an.FldName))
		return dci
	})
}

func (i PlateauItem) HtdItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Htd) == 0 {
		return nil
	}

	return lo.Map(i.Htd, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)
		dci := c.DataCatalogItem("高潮浸水想定区域モデル", an, a.URL, descFromAsset(a, i.DescriptionHtd), nil)
		dci.Name = fldName("高潮浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Htd(an.FldName))
		return dci
	})
}

func (i PlateauItem) IfldItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Ifld) == 0 {
		return nil
	}

	return lo.Map(i.Htd, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)
		dci := c.DataCatalogItem("内水浸水想定区域モデル", an, a.URL, descFromAsset(a, i.DescriptionHtd), nil)
		dci.Name = fldName("内水浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Ifld(an.FldName))
		return dci
	})
}

func (i PlateauItem) TnmItems(c PlateauIntermediateItem) []*DataCatalogItem {
	if len(i.Tnm) == 0 {
		return nil
	}

	return lo.Map(i.Tnm, func(a *cms.PublicAsset, _ int) *DataCatalogItem {
		an := AssetNameFrom(a.URL)
		dci := c.DataCatalogItem("津波浸水想定区域モデル", an, a.URL, descFromAsset(a, i.DescriptionTnm), nil)
		dci.Name = fldName("津波浸水想定区域モデル", i.CityName, an.FldName, c.Dic.Tnm(an.FldName))
		return dci
	})
}

func (i PlateauItem) DataCatalogItems() []DataCatalogItem {
	c := i.IntermediateItem()
	if c.ID == "" {
		return nil
	}

	return util.DerefSlice(lo.Filter(
		append(append(append(append(append(append(
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
			i.IfldItems(c)...,
		),
		func(i *DataCatalogItem, _ int) bool {
			return i != nil
		},
	))
}

func (i PlateauItem) IntermediateItem() PlateauIntermediateItem {
	if i.CityGML == nil {
		return PlateauIntermediateItem{}
	}

	an := AssetNameFrom(i.CityGML.URL)
	dic := Dic{}
	_ = json.Unmarshal(bom.Clean([]byte(i.Dic)), &dic)

	return PlateauIntermediateItem{
		ID:         i.ID,
		Prefecture: i.Prefecture,
		City:       i.CityName,
		CityEn:     an.CityEn,
		CityCode:   an.CityCode,
		Dic:        dic,
	}
}

type PlateauIntermediateItem struct {
	ID         string
	Prefecture string
	City       string
	CityEn     string
	CityCode   string
	Dic        Dic
}

func (i *PlateauIntermediateItem) DataCatalogItem(t string, an AssetName, assetURL, desc string, layers []string) *DataCatalogItem {
	if i == nil {
		return nil
	}

	wardName := i.Dic.WardName(an.WardCode)
	if wardName == "" && an.WardCode != "" {
		wardName = an.WardEn
	}
	cityOrWardName := i.City
	if wardName != "" {
		cityOrWardName = wardName
	}

	name := ""
	if an.Feature == "urf" {
		urfName := urfFeatureTypes[an.UrfFeatureType]
		if urfName == "" {
			urfName = an.UrfFeatureType
		}
		name = fmt.Sprintf("%s（%s）", urfName, cityOrWardName)
	} else {
		name = fmt.Sprintf("%s（%s）", t, cityOrWardName)
	}

	id := strings.Join(lo.Filter([]string{
		i.CityCode,
		i.CityEn,
		an.WardCode,
		an.WardEn,
		an.Feature,
		an.UrfFeatureType,
		an.FldName,
	}, func(s string, _ int) bool { return s != "" }), "_")

	y, _ := strconv.Atoi(an.Year)

	return &DataCatalogItem{
		ID:          id,
		Type:        t,
		TypeEn:      an.Feature,
		Name:        name,
		Prefecture:  i.Prefecture,
		City:        i.City,
		CityEn:      i.CityEn,
		CityCode:    i.CityCode,
		Ward:        wardName,
		WardEn:      an.WardEn,
		WardCode:    an.WardCode,
		Description: desc,
		URL:         assetURLFromFormat(assetURL, an.Format),
		Format:      an.Format,
		Year:        y,
		Layers:      layers,
	}
}

func assetsByWards(a []*cms.PublicAsset) map[string][]*cms.PublicAsset {
	if len(a) == 0 {
		return nil
	}

	r := map[string][]*cms.PublicAsset{}
	for _, a := range a {
		if a == nil {
			continue
		}

		an := AssetNameFrom(a.URL)
		k := an.WardCode
		if _, ok := r[k]; !ok {
			r[k] = []*cms.PublicAsset{a}
		} else {
			r[k] = append(r[k], a)
		}
	}
	return r
}

func maxLOD(a []*cms.PublicAsset) (*cms.PublicAsset, int) {
	if len(a) == 0 {
		return nil, 0
	}

	type lod struct {
		A   *cms.PublicAsset
		LOD int
	}

	lods := lo.FilterMap(a, func(a *cms.PublicAsset, _ int) (lod, bool) {
		if a == nil {
			return lod{}, false
		}
		m := reLod.FindStringSubmatch(a.URL)
		if len(m) < 2 {
			return lod{}, false
		}
		l, err := strconv.Atoi(m[1])
		if err != nil {
			return lod{}, false
		}
		return lod{A: a, LOD: l}, true
	})

	r := lo.MaxBy(lods, func(a, b lod) bool {
		return a.LOD > b.LOD
	})
	return r.A, r.LOD
}

type BldgSet struct {
	LOD        int
	Texture    *cms.PublicAsset
	LowTexture *cms.PublicAsset
	NoTexture  *cms.PublicAsset
}

func maxLODBldg(a []*cms.PublicAsset) *BldgSet {
	if len(a) == 0 {
		return nil
	}

	type lod struct {
		A   *cms.PublicAsset
		F   AssetName
		LOD int
	}

	lods := lo.FilterMap(a, func(a *cms.PublicAsset, _ int) (lod, bool) {
		if a == nil {
			return lod{}, false
		}
		f := AssetNameFrom(a.URL)
		l, _ := strconv.Atoi(f.LOD)
		return lod{A: a, LOD: l, F: f}, true
	})

	l := lo.MaxBy(lods, func(a, b lod) bool {
		return a.LOD > b.LOD
	})

	tex, _ := lo.Find(lods, func(a lod) bool {
		return a.LOD == l.LOD && !a.F.LowTexture && !a.F.NoTexture
	})
	lowtex, _ := lo.Find(lods, func(a lod) bool {
		return a.LOD == l.LOD && a.F.LowTexture
	})
	notex, _ := lo.Find(lods, func(a lod) bool {
		return a.LOD == l.LOD && a.F.NoTexture
	})

	return &BldgSet{
		LOD:        l.LOD,
		Texture:    tex.A,
		LowTexture: lowtex.A,
		NoTexture:  notex.A,
	}
}

func descFromAsset(a *cms.PublicAsset, descs []string) string {
	if a == nil || len(descs) == 0 {
		return ""
	}

	fn := strings.TrimSuffix(path.Base(a.URL), path.Ext(a.URL))
	for _, desc := range descs {
		b, a, ok := strings.Cut(desc, "\n")
		if ok && strings.Contains(b, fn) {
			return strings.TrimSpace(a)
		}
	}
	return ""
}

func searchIndexURLFrom(assets []*cms.PublicAsset, wardCode string) string {
	a, found := lo.Find(assets, func(a *cms.PublicAsset) bool {
		if wardCode == "" {
			return true
		}
		return AssetNameFrom(a.URL).WardCode == wardCode
	})
	if !found {
		return ""
	}

	u, err := url.Parse(a.URL)
	if err != nil {
		return ""
	}

	u.Path = path.Join(assetRootPath(u.Path), "indexRoot.json")
	return u.String()
}

func fldName(t, cityName, raw string, e *DicEntry) string {
	if e == nil {
		return raw
	}
	return fmt.Sprintf("%s %s %s（%s）", t, e.Description, e.Scale, cityName)
}

package datacatalog

import (
	"bytes"
	_ "embed"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/eukarya-inc/jpareacode"
	"github.com/eukarya-inc/reearth-plateauview/server/cms"
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

func (i PlateauItem) IntermediateItem() PlateauIntermediateItem {
	au := ""
	if i.CityGML != nil {
		au = i.CityGML.URL
	} else if len(i.Bldg) > 0 {
		au = i.Bldg[0].URL
	}

	if au == "" {
		return PlateauIntermediateItem{}
	}

	an := AssetNameFrom(au)
	dic := Dic{}
	_ = json.Unmarshal(bom.Clean([]byte(i.Dic)), &dic)
	y, _ := strconv.Atoi(an.Year)

	return PlateauIntermediateItem{
		ID:          i.ID,
		Prefecture:  i.Prefecture,
		City:        i.CityName,
		CityEn:      an.CityEn,
		CityCode:    an.CityCode,
		Dic:         dic,
		OpenDataURL: i.OpenDataURL,
		Year:        y,
	}
}

type PlateauIntermediateItem struct {
	ID          string
	Prefecture  string
	City        string
	CityEn      string
	CityCode    string
	Dic         Dic
	OpenDataURL string
	Year        int
}

func (i *PlateauIntermediateItem) DataCatalogItem(t string, an AssetName, assetURL, desc string, layers []string, firstWard bool, nameOverride string) *DataCatalogItem {
	if i == nil {
		return nil
	}

	id := i.id(an)
	if id == "" {
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

	name, t2, t2en := itemName(t, cityOrWardName, nameOverride, an)
	pref, prefCode := normalizePref(i.Prefecture)

	var itemID string
	if an.Feature == "bldg" && (an.WardCode == "" || firstWard) {
		itemID = i.ID
	}

	opd := i.OpenDataURL
	if opd == "" {
		opd = openDataURLFromAssetName(an)
	}

	return &DataCatalogItem{
		ID:          id,
		ItemID:      itemID,
		Type:        t,
		TypeEn:      an.Feature,
		Type2:       t2,
		Type2En:     t2en,
		Name:        name,
		Pref:        pref,
		PrefCode:    jpareacode.FormatPrefectureCode(prefCode),
		City:        i.City,
		CityEn:      i.CityEn,
		CityCode:    cityCode(i.CityCode, i.City, prefCode),
		Ward:        wardName,
		WardEn:      an.WardEn,
		WardCode:    cityCode(an.WardCode, wardName, prefCode),
		Description: desc,
		URL:         assetURLFromFormat(assetURL, an.Format),
		Format:      an.Format,
		Year:        i.Year,
		Layers:      layers,
		OpenDataURL: opd,
	}
}

func (i *PlateauIntermediateItem) id(an AssetName) string {
	return strings.Join(lo.Filter([]string{
		i.CityCode,
		i.CityEn,
		an.WardCode,
		an.WardEn,
		an.Feature,
		an.UrfFeatureType,
		an.FldNameAndCategory(),
		an.GenName,
	}, func(s string, _ int) bool { return s != "" }), "_")
}

func itemName(t, cityOrWardName, nameOverride string, an AssetName) (name, t2, t2en string) {
	if an.Feature == "urf" {
		t2 = an.UrfFeatureType
		t2en = an.UrfFeatureType

		if urfName := urfFeatureTypes[an.UrfFeatureType]; urfName != "" {
			t2 = urfName
			if nameOverride == "" {
				name = fmt.Sprintf("%sモデル", urfName)
			}
		} else {
			name = an.UrfFeatureType
		}
	}

	if name == "" {
		if nameOverride != "" {
			name = nameOverride
		} else {
			name = t
		}
	}

	name += fmt.Sprintf("（%s）", cityOrWardName)
	return
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

var reName = regexp.MustCompile(`^@name:\s*(.+)(?:$|\n)`)

func descFromAsset(a *cms.PublicAsset, descs []string) (string, string) {
	if a == nil || len(descs) == 0 {
		return "", ""
	}

	fn := strings.TrimSuffix(path.Base(a.URL), path.Ext(a.URL))
	for _, desc := range descs {
		b, a, ok := strings.Cut(desc, "\n")
		if ok && strings.Contains(b, fn) {
			return nameFromDescription(strings.TrimSpace(a))
		}
	}

	return "", ""
}

func nameFromDescription(d string) (string, string) {
	if m := reName.FindStringSubmatch(d); len(m) > 0 {
		name := m[1]
		_, n, _ := strings.Cut(d, "\n")
		return name, strings.TrimSpace(n)
	}

	return "", d
}

type DataCatalogItemConfig struct {
	Data []DataCatalogItemConfigItem `json:"data,omitempty"`
}

type DataCatalogItemConfigItem struct {
	Name   string   `json:"name"`
	URL    string   `json:"url"`
	Type   string   `json:"type"`
	Layers []string `json:"layer,omitempty"`
}

type assetWithLOD struct {
	A   *cms.PublicAsset
	F   AssetName
	LOD int
}

func assetWithLODFromList(a []*cms.PublicAsset) ([]assetWithLOD, int) {
	maxLOD := 0
	return lo.FilterMap(a, func(a *cms.PublicAsset, _ int) (assetWithLOD, bool) {
		l := assetWithLODFrom(a)
		if l != nil && maxLOD < l.LOD {
			maxLOD = l.LOD
		}
		return *l, l != nil
	}), maxLOD
}

func assetWithLODFrom(a *cms.PublicAsset) *assetWithLOD {
	if a == nil {
		return nil
	}
	f := AssetNameFrom(a.URL)
	l, _ := strconv.Atoi(f.LOD)
	return &assetWithLOD{A: a, LOD: l, F: f}
}

func htdTnmIfldName(t, cityName, raw string, e *DicEntry) string {
	if e == nil {
		return raw
	}
	return fmt.Sprintf("%s %s（%s）", t, e.Description, cityName)
}

func urfLayers(ty string) []string {
	if ty == "WaterWay" {
		ty = "Waterway"
	}
	return []string{ty}
}

func openDataURLFromAssetName(a AssetName) string {
	return fmt.Sprintf("https://www.geospatial.jp/ckan/dataset/plateau-%s-%s-%s", a.CityCode, a.CityEn, a.Year)
}

type DataCatalogItemBuilder struct {
	Assets           []*cms.PublicAsset
	Description      string
	ModelName        string
	Layers           []string
	IntermediateItem PlateauIntermediateItem
	NameOverride     string
	FirstWard        bool
	MultipleLOD      bool
}

func (b DataCatalogItemBuilder) Build() *DataCatalogItem {
	if len(b.Assets) == 0 {
		return nil
	}

	an := AssetNameFrom(b.Assets[0].URL)

	dci := b.IntermediateItem.DataCatalogItem(b.ModelName, an, b.Assets[0].URL, b.Description, b.Layers, b.FirstWard, b.NameOverride)
	if dci != nil && b.MultipleLOD {
		dci.Config = multipleLODData(b.Assets, b.ModelName, b.Layers)
	}

	return dci
}

func multipleLODData(assets []*cms.PublicAsset, modelName string, layers []string) DataCatalogItemConfig {
	data := lo.Map(assets, func(a *cms.PublicAsset, j int) DataCatalogItemConfigItem {
		an := AssetNameFrom(a.URL)
		name := ""
		if an.LOD != "" {
			name = fmt.Sprintf("LOD%s", an.LOD)
		} else if len(assets) == 1 {
			name = modelName
		} else {
			name = fmt.Sprintf("%s%d", modelName, j+1)
		}

		return DataCatalogItemConfigItem{
			Name:   name,
			URL:    assetURLFromFormat(a.URL, an.Format),
			Type:   an.Format,
			Layers: layers,
		}
	})
	sort.Slice(data, func(a, b int) bool {
		return strings.Compare(data[a].Name, data[b].Name) < 0
	})

	return DataCatalogItemConfig{
		Data: data,
	}
}

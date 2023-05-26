package plateauv2

import (
	"bytes"
	_ "embed"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/url"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/eukarya-inc/jpareacode"
	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogutil"
	"github.com/samber/lo"
	"github.com/spkg/bom"
)

//go:embed urf.csv
var urfFeatureTypesData []byte
var urfFeatureTypeMap map[string]string
var urfFeatureTypes []string

func init() {
	r := csv.NewReader(bom.NewReader(bytes.NewReader(urfFeatureTypesData)))
	d := lo.Must(r.ReadAll())
	urfFeatureTypes = make([]string, 0, len(d)-1)
	for _, c := range d[1:] {
		urfFeatureTypes = append(urfFeatureTypes, c[0])
	}
	urfFeatureTypeMap = lo.SliceToMap(d[1:], func(c []string) (string, string) {
		return c[0], c[1]
	})
}

type DataCatalogItemBuilder struct {
	Assets           []*cms.PublicAsset
	SearchIndex      []*cms.PublicAsset
	Descriptions     []string
	IntermediateItem PlateauIntermediateItem
	Options          DataCatalogItemBuilderOption
}

type DataCatalogItemBuilderOption struct {
	ModelName           string
	Name                func(AssetName) (string, string, string)
	SubName             func(AssetName, Dic) string
	ItemName            func(AssetName, Dic, int, int) string
	MultipleDesc        bool
	ItemID              bool
	LOD                 bool
	Layers              []string
	ItemLayers          func(AssetName) []string
	LayersForLOD        map[string][]string
	UseMaxLODAsDefault  bool
	UseGroupNameAsName  bool
	UseGroupNameAsLayer bool
	GroupBy             func(AssetName) string
	SortGroupBy         func(AssetName, AssetName) bool
	SortAssetBy         func(AssetName, AssetName) bool
	SearchIndex         bool
}

func (b DataCatalogItemBuilder) Build() []*DataCatalogItem {
	if len(b.Assets) == 0 {
		return nil
	}

	type asset struct {
		Index int
		URL   string
		Name  AssetName
	}

	type assetGroup struct {
		Name   string
		Assets []asset
	}

	assets := lo.Map(b.Assets, func(a *cms.PublicAsset, i int) asset {
		return asset{
			Index: i,
			URL:   a.URL,
			Name:  AssetNameFrom(a.URL),
		}
	})

	// create groups
	var groups []assetGroup
	if b.Options.GroupBy != nil {
		groups = lo.MapToSlice(lo.GroupBy(assets, func(a asset) string {
			return b.Options.GroupBy(a.Name)
		}), func(k string, a []asset) assetGroup {
			return assetGroup{
				Name:   k,
				Assets: a,
			}
		})

		// sort groups
		sort.SliceStable(groups, func(i, j int) bool {
			if b.Options.SortGroupBy != nil {
				return b.Options.SortGroupBy(groups[i].Assets[0].Name, groups[j].Assets[0].Name)
			}

			// sort by asset index
			return groups[i].Assets[0].Index < groups[j].Assets[0].Index
		})
	} else {
		groups = []assetGroup{{Assets: assets}}
	}

	// sort assets in groups
	if b.Options.SortAssetBy != nil {
		for _, g := range groups {
			sort.SliceStable(g.Assets, func(i, j int) bool {
				return b.Options.SortAssetBy(g.Assets[i].Name, g.Assets[j].Name)
			})
		}
	} else if b.Options.LOD {
		for _, g := range groups {
			sort.SliceStable(g.Assets, func(i, j int) bool {
				return g.Assets[i].Name.LODInt() < g.Assets[j].Name.LODInt()
			})
		}
	}

	results := make([]*DataCatalogItem, 0, len(groups))

	for i, g := range groups {
		itemID := b.Options.ItemID && i == 0

		// name and description
		name, desc := "", ""
		if b.Options.MultipleDesc {
			an, ad := descFromAsset(g.Assets[0].URL, b.Descriptions)
			if an != "" && name == "" {
				name = an
			}
			if name == "" && b.Options.UseGroupNameAsName {
				name = g.Name
			}
			if ad != "" {
				desc = ad
			}
		} else if len(b.Descriptions) > 0 {
			desc = b.Descriptions[0]
		}

		// default asset and its URL
		defaultAsset := g.Assets[0]
		if b.Options.UseMaxLODAsDefault {
			defaultAsset = lo.MaxBy(g.Assets, func(a, b asset) bool {
				return a.Name.LODInt() > b.Name.LODInt()
			})
		}

		// default layers
		var mainDefaultLayers []string
		if datacatalogutil.IsLayerSupported(defaultAsset.Name.Format) {
			if b.Options.UseGroupNameAsLayer {
				mainDefaultLayers = []string{g.Name}
			} else if b.Options.LayersForLOD != nil {
				mainDefaultLayers = b.Options.LayersForLOD[defaultAsset.Name.LOD]
			} else {
				mainDefaultLayers = b.Options.Layers
			}
		}

		// config
		var data []DataCatalogItemConfigItem
		mn := b.Options.ModelName
		if name != "" {
			mn = name
		} else if b.Options.UseGroupNameAsName && g.Name != "" {
			mn = g.Name
		}

		itemName := b.Options.ItemName
		if itemName == nil && b.Options.LOD {
			itemName = func(n AssetName, _ Dic, i, len int) string {
				if n.LOD == "" {
					if len == 1 {
						return mn
					}
					return fmt.Sprintf("%s%d", mn, i+1)
				}
				notexture := ""
				if n.NoTexture {
					notexture = "（テクスチャなし）"
				}
				return fmt.Sprintf("LOD%s%s", n.LOD, notexture)
			}
		}

		itemLayers := b.Options.ItemLayers
		if itemLayers == nil && b.Options.LOD {
			itemLayers = func(n AssetName) []string {
				if b.Options.UseGroupNameAsLayer {
					return []string{g.Name}
				}
				if b.Options.LayersForLOD == nil {
					return b.Options.Layers
				}
				return b.Options.LayersForLOD[n.LOD]
			}
		}

		if itemName != nil {
			data = lo.Map(g.Assets, func(a asset, i int) DataCatalogItemConfigItem {
				name := itemName(a.Name, b.IntermediateItem.Dic, i, len(g.Assets))
				if name == "" {
					name = mn
				}

				var layers []string
				if itemLayers != nil && datacatalogutil.IsLayerSupported(a.Name.Format) {
					layers = itemLayers(a.Name)
				}

				return DataCatalogItemConfigItem{
					Name:   name,
					URL:    datacatalogutil.AssetURLFromFormat(a.URL, a.Name.Format),
					Type:   a.Name.Format,
					Layers: layers,
				}
			})
		}

		dci := b.dataCatalogItem(
			defaultAsset.Name,
			defaultAsset.URL,
			desc,
			mainDefaultLayers,
			itemID,
			name,
			data,
		)

		results = append(results, dci)
	}

	return results
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

func (i CMSItem) IntermediateItem() PlateauIntermediateItem {
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

func (b *DataCatalogItemBuilder) dataCatalogItem(an AssetName, assetURL, desc string, layers []string, addItemID bool, nameOverride string, items []DataCatalogItemConfigItem) *DataCatalogItem {
	if b == nil {
		return nil
	}

	dic := b.IntermediateItem.Dic

	id := b.IntermediateItem.id(an)
	if id == "" {
		return nil
	}

	wardName := dic.WardName(an.WardCode)
	if wardName == "" && an.WardCode != "" {
		wardName = an.WardEn
	}

	cityOrWardName := b.IntermediateItem.City
	if wardName != "" {
		cityOrWardName = wardName
	}

	// name
	name := ""
	t2, t2en := "", ""
	if name == "" && b.Options.Name != nil {
		name, t2, t2en = b.Options.Name(an)
	}
	if name == "" {
		name = nameOverride
	}
	if name == "" {
		name = b.Options.ModelName
	}

	// sub name
	name2 := ""
	if b.Options.SubName != nil {
		name2 = b.Options.SubName(an, dic)
		if name2 != "" {
			name2 = " " + name2
		}
	}

	prefCode := jpareacode.PrefectureCodeInt(b.IntermediateItem.Prefecture)

	// item id
	var itemID string
	if addItemID {
		itemID = b.IntermediateItem.ID
	}

	// open data
	opd := b.IntermediateItem.OpenDataURL
	if opd == "" {
		opd = openDataURLFromAssetName(an)
	}

	// search index
	wardCode := datacatalogutil.CityCode(an.WardCode, wardName, prefCode)
	var searchIndex string
	if b.Options.SearchIndex {
		searchIndex = searchIndexURLFrom(b.SearchIndex, wardCode)
	}

	// config
	var config any
	if len(items) > 0 {
		config = DataCatalogItemConfig{
			Data: items,
		}
	}

	return &DataCatalogItem{
		ID:          id,
		ItemID:      itemID,
		Type:        b.Options.ModelName,
		TypeEn:      an.Feature,
		Type2:       t2,
		Type2En:     t2en,
		Name:        fmt.Sprintf("%s%s（%s）", name, name2, cityOrWardName),
		Pref:        b.IntermediateItem.Prefecture,
		PrefCode:    jpareacode.FormatPrefectureCode(prefCode),
		City:        b.IntermediateItem.City,
		CityEn:      b.IntermediateItem.CityEn,
		CityCode:    datacatalogutil.CityCode(b.IntermediateItem.CityCode, b.IntermediateItem.City, prefCode),
		Ward:        wardName,
		WardEn:      an.WardEn,
		WardCode:    wardCode,
		Description: desc,
		URL:         datacatalogutil.AssetURLFromFormat(assetURL, an.Format),
		Format:      an.Format,
		Year:        b.IntermediateItem.Year,
		Layers:      layers,
		OpenDataURL: opd,
		Config:      config,
		SearchIndex: searchIndex,
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
		an.FldFullName(),
		an.GenName,
	}, func(s string, _ int) bool { return s != "" }), "_")
}

var reName = regexp.MustCompile(`^@name:\s*(.+)(?:$|\n)`)

func descFromAsset(assetURL string, descs []string) (string, string) {
	if assetURL == "" || len(descs) == 0 {
		return "", ""
	}

	fn := strings.TrimSuffix(path.Base(assetURL), path.Ext(assetURL))
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

func openDataURLFromAssetName(a AssetName) string {
	return fmt.Sprintf("https://www.geospatial.jp/ckan/dataset/plateau-%s-%s-%s", a.CityCode, a.CityEn, a.Year)
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

	u.Path = path.Join(datacatalogutil.AssetRootPath(u.Path), "indexRoot.json")
	return u.String()
}

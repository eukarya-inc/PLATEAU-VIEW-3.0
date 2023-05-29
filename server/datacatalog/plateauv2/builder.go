package plateauv2

import (
	"bytes"
	_ "embed"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/url"
	"path"
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

type ItemContext struct {
	AssetName   AssetName
	Description Description
	DicEntry    *DicEntry
	GroupName   string
	Index       int
	AssetLen    int
}

type DataCatalogItemBuilderOption struct {
	Type                string
	TypeEn              string
	Layers              []string
	Group               func(ItemContext) Override
	Item                func(ItemContext) ItemOverride
	MultipleDesc        bool
	ItemID              bool
	LOD                 bool
	UseMaxLODAsDefault  bool
	GroupBy             func(AssetName, []AssetName) string
	SortGroupBy         func(AssetName, AssetName) bool
	SortAssetBy         func(AssetName, AssetName) bool
	OmitGroupNameFromID bool
	SearchIndex         bool
}

func (b DataCatalogItemBuilder) groupOverride(defaultAsset asset, defaultDescription Description, defaultDic *DicEntry, g assetGroup) (o Override) {
	if b.Options.Group != nil {
		o = b.Options.Group(ItemContext{
			AssetName:   defaultAsset.Name,
			Description: defaultDescription,
			DicEntry:    defaultDic,
			GroupName:   g.Name,
			Index:       -1,
			AssetLen:    len(g.Assets),
		})
	}
	return o
}

func (b DataCatalogItemBuilder) itemOverride(g assetGroup, a asset, desc Description, dic *DicEntry, i int, all []asset) (o ItemOverride) {
	if b.Options.Item != nil {
		o = b.Options.Item(ItemContext{
			AssetName:   a.Name,
			Description: desc,
			DicEntry:    dic,
			GroupName:   g.Name,
			Index:       i,
			AssetLen:    len(all),
		})
	}

	// name
	if o.Name == "" && b.Options.LOD && len(all) > 0 {
		if a.Name.LOD == "" {
			if len(all) > 1 {
				o.Name = fmt.Sprintf("%s%d", b.Options.Type, i+1)
			} else {
				o.Name = b.Options.Type
			}
		} else {
			notexture := ""
			if a.Name.NoTexture {
				notexture = "（テクスチャなし）"
			}

			o.Name = fmt.Sprintf("LOD%s%s", a.Name.LOD, notexture)
		}
	}

	return
}

type asset struct {
	Index int
	URL   string
	Name  AssetName
}

func (a asset) AssetURL() string {
	return datacatalogutil.AssetURLFromFormat(a.URL, a.Name.Format)
}

type assetGroup struct {
	Name   string
	Assets []asset
}

func (g assetGroup) DefaultAsset(maxLOD bool) asset {
	if maxLOD {
		return lo.MaxBy(g.Assets, func(a, b asset) bool {
			return a.Name.LODInt() > b.Name.LODInt()
		})
	}
	return g.Assets[0]
}

func (b DataCatalogItemBuilder) Build() []*DataCatalogItem {
	if len(b.Assets) == 0 {
		return nil
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
			return b.Options.GroupBy(a.Name, lo.Map(assets, func(a asset, _ int) AssetName { return a.Name }))
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

	overrideBase := Override{
		Name:   b.Options.Type,
		Type:   b.Options.Type,
		TypeEn: b.Options.TypeEn,
		Layers: b.Options.Layers,
	}

	results := make([]*DataCatalogItem, 0, len(groups))

	for i, g := range groups {
		itemID := b.Options.ItemID && i == 0
		defaultAsset := g.DefaultAsset(b.Options.UseMaxLODAsDefault)
		defaultDescription := descFromAsset(defaultAsset.Name, b.Descriptions, !b.Options.MultipleDesc)
		defaultDic := b.IntermediateItem.Dic.FindByAsset(defaultAsset.Name)
		defaultOverride := defaultDescription.Override.Merge(b.groupOverride(defaultAsset, defaultDescription, defaultDic, g).Merge(overrideBase))

		// config
		var config []DataCatalogItemConfigItem
		if b.Options.LOD || b.Options.Item != nil {
			config = lo.Map(g.Assets, func(a asset, i int) DataCatalogItemConfigItem {
				description := descFromAsset(a.Name, b.Descriptions, !b.Options.MultipleDesc)
				dic := b.IntermediateItem.Dic.FindByAsset(a.Name)
				override := description.Override.Item().Merge(b.itemOverride(g, a, description, dic, i, g.Assets).Merge(overrideBase.Item()))

				return DataCatalogItemConfigItem{
					Name:   override.Name,
					URL:    a.AssetURL(),
					Type:   a.Name.Format,
					Layers: override.LayersIfSupported(a.Name.Format),
				}
			})
		}

		dci := b.dataCatalogItem(
			defaultAsset,
			g,
			defaultDescription.Desc,
			itemID,
			config,
			defaultOverride,
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

func (b *DataCatalogItemBuilder) dataCatalogItem(a asset, g assetGroup, desc string, addItemID bool, items []DataCatalogItemConfigItem, override Override) *DataCatalogItem {
	if b == nil {
		return nil
	}

	gname := ""
	if !b.Options.OmitGroupNameFromID {
		gname = g.Name
	}
	id := b.IntermediateItem.id(a.Name, gname)
	if id == "" {
		return nil
	}

	wardName := b.IntermediateItem.Dic.WardName(a.Name.WardCode)
	if wardName == "" && a.Name.WardCode != "" {
		wardName = a.Name.WardEn
	}

	cityOrWardName := b.IntermediateItem.City
	if wardName != "" {
		cityOrWardName = wardName
	}

	prefCode := jpareacode.PrefectureCodeInt(b.IntermediateItem.Prefecture)
	wardCode := datacatalogutil.CityCode(a.Name.WardCode, wardName, prefCode)

	// name
	var subname string
	if override.SubName != "" {
		subname = " " + override.SubName
	}
	var area string
	if override.Area != "" {
		area = override.Area
	} else {
		area = cityOrWardName
	}
	finalName := fmt.Sprintf("%s%s（%s）", override.Name, subname, area)

	// item id
	var itemID string
	if addItemID {
		itemID = b.IntermediateItem.ID
	}

	// open data
	opd := b.IntermediateItem.OpenDataURL
	if opd == "" {
		opd = openDataURLFromAssetName(a.Name)
	}

	// search index
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
		Type:        override.Type,
		TypeEn:      override.TypeEn,
		Type2:       override.Type2,
		Type2En:     override.Type2En,
		Name:        finalName,
		Pref:        b.IntermediateItem.Prefecture,
		PrefCode:    jpareacode.FormatPrefectureCode(prefCode),
		City:        b.IntermediateItem.City,
		CityEn:      b.IntermediateItem.CityEn,
		CityCode:    datacatalogutil.CityCode(b.IntermediateItem.CityCode, b.IntermediateItem.City, prefCode),
		Ward:        wardName,
		WardEn:      a.Name.WardEn,
		WardCode:    wardCode,
		Description: desc,
		URL:         a.AssetURL(),
		Format:      a.Name.Format,
		Year:        b.IntermediateItem.Year,
		Layers:      override.LayersIfSupported(a.Name.Format),
		OpenDataURL: opd,
		Config:      config,
		SearchIndex: searchIndex,
	}
}

func (i *PlateauIntermediateItem) id(an AssetName, groupName string) string {
	return strings.Join(lo.Filter([]string{
		i.CityCode,
		i.CityEn,
		an.WardCode,
		an.WardEn,
		an.Feature,
		groupName,
	}, func(s string, _ int) bool { return s != "" }), "_")
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

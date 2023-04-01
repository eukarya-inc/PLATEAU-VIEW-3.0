package sdkapi

import (
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/mitchellh/mapstructure"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const modelKey = "plateau"

type Config struct {
	CMSBaseURL   string
	CMSToken     string
	Project      string
	Model        string
	Token        string
	DisableCache bool
	CacheTTL     int
}

func (c *Config) Default() {
	if c.Model == "" {
		c.Model = modelKey
	}
}

type DatasetResponse struct {
	Data []*DatasetPref `json:"data"`
}

type DatasetPref struct {
	ID    string        `json:"id"`
	Title string        `json:"title"`
	Data  []DatasetCity `json:"data"`
}

type DatasetCity struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	FeatureTypes []string `json:"featureTypes"`
}

type FilesResponse map[string][]File

type File struct {
	Code   string  `json:"code"`
	URL    string  `json:"url"`
	MaxLOD float64 `json:"maxLod"`
}

type Items []Item

func (i Items) DatasetResponse() (r *DatasetResponse) {
	r = &DatasetResponse{}
	prefs := []*DatasetPref{}
	prefm := map[string]*DatasetPref{}
	for _, i := range i {
		ft := i.FeatureTypes()
		if len(ft) == 0 {
			continue
		}

		if _, ok := prefm[i.Prefecture]; !ok {
			pd := &DatasetPref{
				ID:    i.Prefecture,
				Title: i.Prefecture,
			}
			prefs = append(prefs, pd)
			prefm[i.Prefecture] = prefs[len(prefs)-1]
		}

		d := DatasetCity{
			ID:           i.ID,
			Title:        i.CityName,
			Description:  i.Description,
			FeatureTypes: ft,
		}
		pd := prefm[i.Prefecture]
		pd.Data = append(pd.Data, d)
	}

	r.Data = prefs
	return
}

type Item struct {
	ID             string            `json:"id"`
	Prefecture     string            `json:"prefecture"`
	CityName       string            `json:"city_name"`
	CityGML        *cms.PublicAsset  `json:"citygml"`
	Description    string            `json:"description_bldg"`
	MaxLOD         *cms.PublicAsset  `json:"max_lod"`
	Bldg           []cms.PublicAsset `json:"bldg"`
	Tran           []cms.PublicAsset `json:"tran"`
	Frn            []cms.PublicAsset `json:"frn"`
	Veg            []cms.PublicAsset `json:"veg"`
	SDKPublication string            `json:"sdk_publication"`
}

func (i Item) IsPublic() bool {
	return i.SDKPublication == "公開する"
}

func (i Item) FeatureTypes() (t []string) {
	if len(i.Bldg) > 0 {
		t = append(t, "bldg")
	}
	if len(i.Tran) > 0 {
		t = append(t, "tran")
	}
	if len(i.Frn) > 0 {
		t = append(t, "frn")
	}
	if len(i.Veg) > 0 {
		t = append(t, "veg")
	}
	return
}

type MaxLODColumns []MaxLODColumn

type MaxLODColumn struct {
	Code   string  `json:"code"`
	Type   string  `json:"type"`
	MaxLOD float64 `json:"maxLod"`
}

type MaxLODMap map[string]map[string]float64

func (mc MaxLODColumns) Map() MaxLODMap {
	m := MaxLODMap{}

	for _, c := range mc {
		if _, ok := m[c.Type]; !ok {
			m[c.Type] = map[string]float64{}
		}
		t := m[c.Type]
		t[c.Code] = c.MaxLOD
	}

	return m
}

func (mm MaxLODMap) Files(urls []*url.URL) (r FilesResponse) {
	r = FilesResponse{}
	for ty, m := range mm {
		if _, ok := r[ty]; !ok {
			r[ty] = ([]File)(nil)
		}
		for code, maxlod := range m {
			prefix := fmt.Sprintf("%s_%s_", code, ty)
			u, ok := lo.Find(urls, func(u *url.URL) bool {
				return strings.HasPrefix(path.Base(u.Path), prefix) && path.Ext(u.Path) == ".gml"
			})
			if ok {
				r[ty] = append(r[ty], File{
					Code:   code,
					URL:    u.String(),
					MaxLOD: maxlod,
				})
			}
		}
		slices.SortFunc(r[ty], func(i, j File) bool {
			return i.Code < j.Code
		})
	}
	return
}

type IItem struct {
	ID             string           `json:"id" cms:"id,text"`
	Prefecture     string           `json:"prefecture" cms:"prefecture,text"`
	CityName       string           `json:"city_name" cms:"city_name,text"`
	CityGML        map[string]any   `json:"citygml" cms:"citygml,asset"`
	Description    string           `json:"description_bldg" cms:"description_bldg,textarea"`
	MaxLOD         map[string]any   `json:"max_lod" cms:"max_lod,asset"`
	Bldg           []map[string]any `json:"bldg" cms:"bldg,asset"`
	Tran           []map[string]any `json:"tran" cms:"tran,asset"`
	Frn            []map[string]any `json:"frn" cms:"frn,asset"`
	Veg            []map[string]any `json:"veg" cms:"veg,asset"`
	SDKPublication string           `json:"sdk_publication" cms:"sdk_publication,select"`
}

func (i IItem) Item() Item {
	return Item{
		ID:             i.ID,
		Prefecture:     i.Prefecture,
		CityName:       i.CityName,
		CityGML:        integrationAssetToAsset(i.CityGML).ToPublic(),
		Description:    i.Description,
		MaxLOD:         integrationAssetToAsset(i.MaxLOD).ToPublic(),
		Bldg:           assetsToPublic(integrationAssetToAssets(i.Bldg)),
		Tran:           assetsToPublic(integrationAssetToAssets(i.Tran)),
		Frn:            assetsToPublic(integrationAssetToAssets(i.Frn)),
		Veg:            assetsToPublic(integrationAssetToAssets(i.Veg)),
		SDKPublication: i.SDKPublication,
	}
}

func ItemsFromIntegration(items []cms.Item) Items {
	return lo.FilterMap(items, func(i cms.Item, _ int) (Item, bool) {
		item := ItemFromIntegration(&i)
		return item, item.IsPublic()
	})
}

func ItemFromIntegration(ci *cms.Item) Item {
	i := IItem{}
	ci.Unmarshal(&i)
	return i.Item()
}

func assetsToPublic(a []cms.Asset) []cms.PublicAsset {
	return lo.FilterMap(a, func(a cms.Asset, _ int) (cms.PublicAsset, bool) {
		p := a.ToPublic()
		if p == nil {
			return cms.PublicAsset{}, false
		}
		return *p, true
	})
}

func integrationAssetToAssets(a []map[string]any) []cms.Asset {
	return lo.FilterMap(a, func(a map[string]any, _ int) (cms.Asset, bool) {
		pa := integrationAssetToAsset(a)
		if pa == nil {
			return cms.Asset{}, false
		}
		return *pa, true
	})
}

func integrationAssetToAsset(a map[string]any) *cms.Asset {
	if a == nil {
		return nil
	}
	pa := &cms.Asset{}
	if err := mapstructure.Decode(a, pa); err != nil {
		return nil
	}
	return pa
}

package sdkapi

import (
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const modelKey = "plateau"

type Config struct {
	CMSBaseURL string
	Project    string
	Model      string
	Token      string
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
	ID          string            `json:"id"`
	Prefecture  string            `json:"prefecture"`
	CityName    string            `json:"city_name"`
	CityGML     *cms.PublicAsset  `json:"citygml"`
	Description string            `json:"description_bldg"`
	MaxLOD      *cms.PublicAsset  `json:"max_lod"`
	Bldg        []cms.PublicAsset `json:"bldg"`
	Tran        []cms.PublicAsset `json:"tran"`
	Frn         []cms.PublicAsset `json:"frn"`
	Veg         []cms.PublicAsset `json:"veg"`
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

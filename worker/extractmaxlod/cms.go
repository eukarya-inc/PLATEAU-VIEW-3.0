package extractmaxlod

import (
	"context"
	"fmt"
	"slices"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
)

var featureTypes = []string{
	"bldg", // 建築物モデル
	"tran", // 交通（道路）モデル
	"rwy",  // 交通（鉄道）モデル
	"trk",  // 交通（徒歩道）モデル
	"squr", // 交通（広場）モデル
	"wwy",  // 交通（航路）モデル
	"luse", // 土地利用モデル
	"fld",  // 洪水浸水想定区域モデル
	"tnm",  // 津波浸水想定区域モデル
	"htd",  // 高潮浸水想定区域モデル
	"ifld", // 内水浸水想定区域モデル
	"lsld", // 土砂災害モデル
	"urf",  // 都市計画決定情報モデル
	"unf",  // 地下埋設物モデル
	"brid", // 橋梁モデル
	"tun",  // トンネルモデル
	"cons", // その他の構造物モデル
	"frn",  // 都市設備モデル
	"ubld", // 地下街モデル
	"veg",  // 植生モデル
	"dem",  // 地形モデル
	"wtr",  // 水部モデル
	"area", // 区域モデル
	"gen",  // 汎用都市オブジェクトモデル
}

var FixedMaxLOD = map[string]string{
	"dem": "1",
}

type City struct {
	ID         string            `cms:"id"`
	Name       string            `cms:"city_name"`
	NameEn     string            `cms:"city_name_en"`
	Code       string            `cms:"city_code"`
	References map[string]string `cms:"-"`
}

type Feature struct {
	ID      string `cms:"id"`
	CityGML string `cms:"citygml,asset"`
	MaxLOD  string `cms:"maxlod,asset"`
}

func fetchCities(ctx context.Context, c cms.Interface, conf Config) ([]*City, error) {
	if len(conf.CityItemID) > 0 {
		return fetchCitiesByIDs(ctx, c, conf.CityItemID)
	}

	// fetch all cities
	log.Infofc(ctx, "fetching all cities")
	items, err := c.GetItemsByKeyInParallel(ctx, conf.ProjectID, model, false, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch cities: %w", err)
	}

	res := make([]*City, 0, len(items.Items))
	for _, i := range items.Items {
		if c := toCity(&i); c != nil {

			if len(conf.CityNames) > 0 {
				found := slices.Contains(conf.CityNames, c.Name)
				if !found {
					continue
				}
			}

			res = append(res, c)
		}
	}

	return res, nil
}

func fetchCitiesByIDs(ctx context.Context, c cms.Interface, ids []string) (res []*City, _ error) {
	for _, id := range ids {
		log.Infofc(ctx, "fetching city: %s", id)
		i, err := c.GetItem(ctx, id, false)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch city: %w", err)
		}

		if c := toCity(i); c != nil {
			res = append(res, c)
		}
	}

	return
}

func toCity(i *cms.Item) *City {
	city := &City{}
	i.Unmarshal(city)

	references := map[string]string{}
	for _, ft := range featureTypes {
		if ref := i.FieldByKey(ft).GetValue().String(); ref != nil {
			references[ft] = *ref
		}
	}

	city.References = references
	return city
}

func toFeature(i *cms.Item) *Feature {
	city := &Feature{
		ID:      i.ID,
		CityGML: i.FieldByKey("citygml").GetValue().AssetURL(),
		MaxLOD:  i.FieldByKey("max_lod").GetValue().AssetURL(),
	}
	return city
}

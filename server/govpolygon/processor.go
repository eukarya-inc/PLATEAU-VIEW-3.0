package govpolygon

import (
	_ "embed"
	"sort"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/samber/lo"
)

func ComputeGeoJSON(names []string) ([]*geojson.Feature, []string, error) {
	res, notfound := computeGeojsonFeatures(JapanCityFeatures, names)
	return res.Features, notfound, nil
}

func computeGeojsonFeatures(features []*geojson.Feature, names []string) (*geojson.FeatureCollection, []string) {
	if len(names) == 0 {
		fc := geojson.NewFeatureCollection()
		for _, f := range features {
			fc.AddFeature(f)
		}
		return fc, nil
	}

	nameMap := map[string]struct{}{}
	notfound := map[string]struct{}{}
	citiesWithWards := map[string]struct{}{}
	for _, n := range names {
		nameMap[n] = struct{}{}
		notfound[n] = struct{}{}

		s := strings.Split(n, "/")
		if len(s) >= 3 && s[2] != "" {
			citiesWithWards[s[0]+"/"+s[1]] = struct{}{}
		}
	}

	result := geojson.NewFeatureCollection()

	for _, f := range features {
		code, ok := f.Properties["code"].(string)
		if !ok || code == "" {
			continue
		}
		pref, ok := f.Properties["prefecture"].(string)
		if !ok || pref == "" {
			continue
		}
		city, ok := f.Properties["city"].(string)
		if !ok || city == "" {
			continue
		}
		ward, _ := f.Properties["ward"].(string)

		var wardName, cityName string
		var wardHit, cityHit, prefHit bool
		if ward != "" {
			wardName = pref + "/" + city + "/" + ward
			_, wardHit = nameMap[wardName]
			if wardHit {
				delete(notfound, wardName)
			}
		}

		cityName = pref + "/" + city
		_, cityHit = nameMap[cityName]
		if ward == "" && !cityHit {
			_, cityHit = citiesWithWards[cityName]
		}
		if cityHit {
			delete(notfound, cityName)
		}

		_, prefHit = nameMap[pref]
		if prefHit {
			delete(notfound, pref)
		}

		if wardHit || cityHit || prefHit {
			result.AddFeature(f)
		}
	}

	notfounds := lo.Keys(notfound)
	sort.Strings(notfounds)

	return result, notfounds
}

package datacatalogv3

import (
	"slices"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
)

func toCityGMLs(all *AllData, regYear int) (map[plateauapi.ID]*plateauapi.CityGMLDataset, []string) {
	res := map[plateauapi.ID]*plateauapi.CityGMLDataset{}
	resCity := map[string]*plateauapi.CityGMLDataset{}
	dataMap := make(map[string]*GeospatialjpDataItem)
	cityMap := make(map[string]*CityItem)

	for _, d := range all.GeospatialjpDataItems {
		if d.CityGML == "" || d.MaxLOD == "" {
			continue
		}
		dataMap[d.City] = d
	}

	indexByID := make(map[string]*GeospatialjpIndexItem)
	indexByCity := make(map[string]*GeospatialjpIndexItem)
	for _, i := range all.GeospatialjpIndexItems {
		if i == nil {
			continue
		}
		indexByID[i.ID] = i
		if i.City != "" {
			indexByCity[i.City] = i
		}
	}

	for _, city := range all.City {
		data := dataMap[city.ID]
		if data == nil {
			continue
		}

		prefCode := plateauapi.AreaCode(city.CityCode).PrefectureCode()
		gspatialjpURL := geospatialjpURL(city.CityCode, city.CityName, city.YearInt())
		var gspatialjpURLPtr *string
		if gspatialjpURL != "" {
			gspatialjpURLPtr = &gspatialjpURL
		}
		var fileSize *int
		if data.CityGMLSize > 0 {
			n := int(data.CityGMLSize)
			fileSize = &n
		}
		d := &plateauapi.CityGMLDataset{
			ID:                   plateauapi.CityGMLDatasetIDFrom(plateauapi.AreaCode(city.CityCode)),
			URL:                  data.CityGML,
			FileSize:             fileSize,
			GspatialjpDatasetURL: gspatialjpURLPtr,
			Year:                 city.YearInt(),
			RegistrationYear:     regYear,
			PrefectureCode:       plateauapi.AreaCode(prefCode),
			PrefectureID:         plateauapi.NewID(prefCode, plateauapi.TypePrefecture),
			CityID:               plateauapi.NewID(city.CityCode, plateauapi.TypeCity),
			CityCode:             plateauapi.AreaCode(city.CityCode),
			FeatureTypes:         all.FeatureTypesOf(city.ID),
			PlateauSpecMinorID:   plateauapi.PlateauSpecIDFrom(city.Spec),
			MetadataZipUrls:      city.MetadataZipURLs(),
			GspatialjpFiles:      gspatialjpFiles(data, findIndexItem(city, indexByID, indexByCity)),
			Admin: adminFrom(Admin{
				ItemID:      city.ID,
				Stage:       city.SDKStage(),
				CMSURL:      all.CMSInfo.ItemBaseURL(cityModel),
				MaxLODURLs:  []string{data.MaxLOD},
				CityGMLURLs: []string{data.CityGML},
			}),
		}

		cityMap[city.ID] = city
		res[d.ID] = d
		resCity[data.City] = d
	}

	// add citygml urls for sample data
	for ft, data := range all.Plateau {
		for _, d := range data {
			if !d.Sample || d.MaxLOD == "" || d.CityGML == "" /*|| !d.IsBeta()*/ {
				continue
			}

			citygml := resCity[d.City]
			if citygml == nil {
				continue
			}

			city := cityMap[d.City]
			if city == nil || !city.SDKPublic {
				continue
			}

			addCityGML(d.CityGML, d.MaxLOD, ft, citygml)
		}
	}

	for _, d := range all.Sample {
		if d.MaxLOD == "" || d.CityGML == "" {
			continue
		}

		citygml := resCity[d.City]
		if citygml == nil {
			continue
		}

		city := cityMap[d.City]
		if city == nil || !city.SDKPublic {
			continue
		}

		addCityGML(d.CityGML, d.MaxLOD, d.FeatureType, citygml)
	}

	return res, nil
}

// findIndexItem resolves the geospatialjp-index item of a city, preferring the
// reference held by the city item and falling back to the back reference.
func findIndexItem(city *CityItem, byID, byCity map[string]*GeospatialjpIndexItem) *GeospatialjpIndexItem {
	if city.GeospatialjpIndex != "" {
		if i := byID[city.GeospatialjpIndex]; i != nil {
			return i
		}
	}
	return byCity[city.ID]
}

// gspatialjpFiles lists the CMS assets that geospatialjpv3.Publish registers
// as CKAN resources, in the same order (CityGML, 3D Tiles・MVT, 関連データセット,
// その他データセット). データ目録と索引図も CKAN に登録されるが、データカタログでは
// 公開しない方針のため含めない。
func gspatialjpFiles(data *GeospatialjpDataItem, index *GeospatialjpIndexItem) []*plateauapi.GspatialjpFile {
	var res []*plateauapi.GspatialjpFile
	add := func(kind plateauapi.GspatialjpFileKind, name, url string, size int64) {
		if url == "" {
			return
		}
		res = append(res, &plateauapi.GspatialjpFile{Kind: kind, Name: name, URL: url, FileSize: size})
	}

	if data != nil {
		add(plateauapi.GspatialjpFileKindCityGML, "", data.CityGML, data.CityGMLSize)
		add(plateauapi.GspatialjpFileKind3DTilesMVT, "", data.Plateau, data.PlateauSize)
		add(plateauapi.GspatialjpFileKindRelated, "", data.Related, data.RelatedSize)
	}
	if index != nil {
		for _, g := range index.Generics {
			add(plateauapi.GspatialjpFileKindOther, g.Name, g.Asset.URL, g.Asset.Size)
		}
	}
	return res
}

func addCityGML(citygmlURL, maxlodURL, featureType string, citygml *plateauapi.CityGMLDataset) {
	if citygmlURL == "" || maxlodURL == "" {
		return
	}

	admin := plateauapi.AdminFrom(citygml.Admin)
	admin.CityGMLURLs = append(admin.CityGMLURLs, citygmlURL)
	admin.MaxLODURLs = append(admin.MaxLODURLs, maxlodURL)
	citygml.Admin = &admin

	if featureType != "" && !slices.Contains(citygml.FeatureTypes, featureType) {
		citygml.FeatureTypes = append(citygml.FeatureTypes, featureType)
	}
}

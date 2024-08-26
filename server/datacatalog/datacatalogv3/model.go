package datacatalogv3

import "github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"

type AllData struct {
	Name                  string
	Year                  int
	PlateauSpecs          []plateauapi.PlateauSpecSimple
	FeatureTypes          FeatureTypes
	City                  []*CityItem
	Related               []*RelatedItem
	Generic               []*GenericItem
	Sample                []*PlateauFeatureItem
	Plateau               map[string][]*PlateauFeatureItem
	GeospatialjpDataItems []*GeospatialjpDataItem
	CMSInfo               CMSInfo
}

func (d *AllData) FindPlateauFeatureItemByCityID(ft, cityID string) *PlateauFeatureItem {
	for _, f := range d.Plateau[ft] {
		if f != nil && f.City == cityID {
			return f
		}
	}
	return nil
}

func (d *AllData) FindPlateauFeatureItemsByCityID(cityID string) (res []*PlateauFeatureItem) {
	for _, ft := range d.FeatureTypes.Plateau {
		for _, f := range d.Plateau[ft.Code] {
			if f != nil && f.City == cityID {
				res = append(res, f)
			}
		}
	}
	return
}

func (all *AllData) FeatureTypesOf(cityID string) (res []string) {
	for _, ft := range all.FeatureTypes.Plateau {
		if p := all.FindPlateauFeatureItemByCityID(ft.Code, cityID); p != nil && p.CityGML != "" {
			res = append(res, ft.Code)
		}
	}

	return res
}

func (d *AllData) FindGspatialjpDataItemByCityID(cityID string) *GeospatialjpDataItem {
	for _, i := range d.GeospatialjpDataItems {
		if i != nil && i.City == cityID {
			return i
		}
	}
	return nil
}

type FeatureTypes struct {
	Plateau []FeatureType
	Related []FeatureType
	Generic []FeatureType
}

func (ft FeatureTypes) PlateauMap() map[string]*FeatureType {
	res := make(map[string]*FeatureType)
	for _, f := range ft.Plateau {
		f := f
		res[f.Code] = &f
	}
	return res
}

func (ft FeatureTypes) FindPlateauByCode(code string) *FeatureType {
	for _, f := range ft.Plateau {
		if f.Code == code {
			return &f
		}
	}
	return nil
}

type CMSInfo struct {
	CMSURL         string
	WorkspaceID    string
	ProjectID      string
	PlateauModelID map[string]string
	RelatedModelID string
	GenericModelID string
}

func (c CMSInfo) PlateauItemBaseURL() map[string]string {
	if c.CMSURL == "" || c.WorkspaceID == "" || c.ProjectID == "" || c.PlateauModelID == nil {
		return nil
	}

	res := make(map[string]string)
	for k, v := range c.PlateauModelID {
		res[k] = c.CMSURL + "/workspace/" + c.WorkspaceID + "/project/" + c.ProjectID + "/content/" + v + "/details/"
	}

	return res
}

func (c CMSInfo) RelatedItemBaseURL() string {
	if c.CMSURL == "" || c.WorkspaceID == "" || c.ProjectID == "" || c.RelatedModelID == "" {
		return ""
	}
	return c.CMSURL + "/workspace/" + c.WorkspaceID + "/project/" + c.ProjectID + "/content/" + c.RelatedModelID + "/details/"
}

func (c CMSInfo) GenericItemBaseURL() string {
	if c.CMSURL == "" || c.WorkspaceID == "" || c.ProjectID == "" || c.GenericModelID == "" {
		return ""
	}
	return c.CMSURL + "/workspace/" + c.WorkspaceID + "/project/" + c.ProjectID + "/content/" + c.GenericModelID + "/details/"
}

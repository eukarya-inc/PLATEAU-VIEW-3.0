package plateauapi

import (
	"fmt"
	"slices"
	"sort"
	"strings"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	"github.com/samber/lo"
)

func FindItem(d Dataset, id ID) DatasetItem {
	res, _ := lo.Find(d.GetItems(), func(i DatasetItem) bool {
		return i.GetID() == id
	})
	return res
}

type Areas map[AreaType][]Area

func (a Areas) Append(cat AreaType, as []Area) {
	a[cat] = append(a[cat], as...)
}

func (a Areas) All() []Area {
	entries := lo.Entries(a)
	sort.Slice(entries, func(i, j int) bool {
		return slices.Index(AllAreaType, entries[i].Key) < slices.Index(AllAreaType, entries[j].Key)
	})
	return lo.FlatMap(entries, func(e lo.Entry[AreaType, []Area], _ int) []Area {
		return e.Value
	})
}

func (a Areas) Filter(f func(a Area) bool) []Area {
	return lo.Filter(a.All(), func(a Area, _ int) bool {
		return f(a)
	})
}

func (a Areas) Find(f func(a Area) bool) Area {
	res, _ := lo.Find(a.All(), f)
	return res
}

func (a Areas) FindByCode(code AreaCode) Area {
	return a.Find(func(a Area) bool {
		return a.GetCode() == code
	})
}

func (a Areas) FindByCodeAndType(code AreaCode, ty AreaType) Area {
	areas := a[ty]
	if areas == nil {
		return nil
	}
	res, _ := lo.Find(areas, func(a Area) bool {
		return a.GetCode() == code
	})
	return res
}

func (a *Areas) Area(id ID) Area {
	for _, area := range a.All() {
		if area.GetID() == id {
			return area
		}
	}
	return nil
}

func DatasetTypeCategoryFromDataset(d Dataset) DatasetTypeCategory {
	switch d.(type) {
	case PlateauDataset:
		return DatasetTypeCategoryPlateau
	case *PlateauDataset:
		return DatasetTypeCategoryPlateau
	case RelatedDataset:
		return DatasetTypeCategoryRelated
	case *RelatedDataset:
		return DatasetTypeCategoryRelated
	case GenericDataset:
		return DatasetTypeCategoryGeneric
	case *GenericDataset:
		return DatasetTypeCategoryGeneric
	}
	return ""
}

type Datasets map[DatasetTypeCategory][]Dataset

func (d Datasets) Append(cat DatasetTypeCategory, ds []Dataset) {
	d[cat] = append(d[cat], ds...)
}

func (d Datasets) All() []Dataset {
	entries := lo.Entries(d)
	sort.Slice(entries, func(i, j int) bool {
		return slices.Index(AllDatasetTypeCategory, entries[i].Key) < slices.Index(AllDatasetTypeCategory, entries[j].Key)
	})
	return lo.FlatMap(entries, func(e lo.Entry[DatasetTypeCategory, []Dataset], _ int) []Dataset {
		return e.Value
	})
}

func (d Datasets) Filter(f func(d Dataset) bool) []Dataset {
	return lo.Filter(d.All(), func(d Dataset, _ int) bool {
		return f(d)
	})
}

func (d *Datasets) Dataset(id ID) Dataset {
	for _, ds := range d.All() {
		if ds.GetID() == id {
			return ds
		}
	}
	return nil
}

func (d *Datasets) Item(id ID) DatasetItem {
	for _, ds := range d.All() {
		if item := FindItem(ds, id); item != nil {
			return item
		}
	}
	return nil
}

type DatasetTypes map[DatasetTypeCategory][]DatasetType

func (d DatasetTypes) Append(cat DatasetTypeCategory, ds []DatasetType) {
	d[cat] = append(d[cat], ds...)
}

func (d DatasetTypes) All() []DatasetType {
	entries := lo.Entries(d)
	sort.Slice(entries, func(i, j int) bool {
		return slices.Index(AllDatasetTypeCategory, entries[i].Key) < slices.Index(AllDatasetTypeCategory, entries[j].Key)
	})
	return lo.FlatMap(entries, func(e lo.Entry[DatasetTypeCategory, []DatasetType], _ int) []DatasetType {
		return e.Value
	})
}

func (d DatasetTypes) CodeMap(cat DatasetTypeCategory) map[string]DatasetType {
	res := make(map[string]DatasetType)
	for _, ds := range d[cat] {
		ds := ds
		res[ds.GetCode()] = ds
	}
	return res
}

func (d DatasetTypes) DatasetTypesByCategory(cat DatasetTypeCategory) []DatasetType {
	if cat == "" {
		return d.All()
	}
	return d[cat]
}

func (d DatasetTypes) DatasetTypesByCategories(categories []DatasetTypeCategory) (res []DatasetType) {
	for _, cat := range categories {
		res = append(res, d[cat]...)
	}

	slices.SortStableFunc(res, func(a, b DatasetType) int {
		return strings.Compare(a.GetCode(), b.GetCode())
	})

	return res
}

func (d DatasetTypes) Filter(f func(d DatasetType) bool) []DatasetType {
	return lo.Filter(d.All(), func(d DatasetType, _ int) bool {
		return f(d)
	})
}

func (d *DatasetTypes) DatasetType(id ID) DatasetType {
	for _, ds := range d.All() {
		if ds.GetID() == id {
			return ds
		}
	}
	return nil
}

func (d DatasetTypes) FindByCode(code string, cat DatasetTypeCategory) DatasetType {
	types := d.DatasetTypesByCategory(cat)
	t, _ := lo.Find(types, func(d DatasetType) bool {
		return d.GetCode() == code
	})
	return t
}

func (s *PlateauSpec) Minor(name string) *PlateauSpecMinor {
	for _, minor := range s.MinorVersions {
		if minor.Name == name {
			return minor
		}
	}
	return nil
}

func FindSpecMinorByName(specs []PlateauSpec, name string) *PlateauSpecMinor {
	for _, spec := range specs {
		if specMinor := spec.Minor(name); specMinor != nil {
			return specMinor
		}
	}
	return nil
}

func stageFromCityGMLDataset(ds *CityGMLDataset) string {
	admin := ds.Admin
	if admin == nil {
		return ""
	}

	return AdminFrom(admin).Stage
}

func (d PlateauDatasetType) GetYear() int {
	return d.Year
}

func (d PlateauSpec) GetYear() int {
	return d.Year
}

func (d PlateauSpecMinor) GetYear() int {
	return d.Year
}

var _ YearNode = (*PlateauDatasetType)(nil)
var _ YearNode = (*PlateauSpec)(nil)
var _ YearNode = (*PlateauSpecMinor)(nil)

func IsLayerSupported(format DatasetFormat) bool {
	return datacatalogutil.IsLayerSupported(strings.ToLower(string(format)))
}

func CityGMLDatasetIDFrom(areaCode AreaCode) ID {
	return NewID(areaCode.String(), TypeCityGML)
}

type VagueID interface {
	VagueID() string
}

func (a *PlateauDataset) VagueID() string {
	return fmt.Sprintf("d_%s_%s", mostDetailedAreaCodeFrom(a), a.TypeCode)
}

func getVagueID(n any) string {
	if v, ok := n.(VagueID); ok && v != nil {
		return v.VagueID()
	}
	return ""
}

func ToDatasets[T Dataset](p []T) []Dataset {
	res := make([]Dataset, 0, len(p))
	for _, ds := range p {
		res = append(res, ds)
	}
	return res
}

func PlateauDatasetsToGenericDatasets(p []*PlateauDataset, typeID ID, typeCode, idSuffix string) []*GenericDataset {
	res := make([]*GenericDataset, 0, len(p))
	for _, ds := range p {
		res = append(res, PlateauDatasetToGenericDataset(ds, typeID, typeCode, idSuffix))
	}
	return res
}

func PlateauDatasetToGenericDataset(p *PlateauDataset, typeID ID, typeCode string, idSuffix string) *GenericDataset {
	cityCode := p.CityCode.RefString()
	rawID := strings.TrimPrefix(p.ID.String(), "d_")
	newID := p.ID
	if idSuffix != "" {
		newID = ID(string(p.ID) + "_" + idSuffix)
	}

	items := make([]*GenericDatasetItem, 0, len(p.Items))
	for _, item := range p.Items {
		itemID := item.ID.String()
		if idSuffix != "" {
			if ids := strings.Split(itemID, rawID); len(ids) == 2 {
				itemID = fmt.Sprintf("%s%s_%s%s", ids[0], rawID, idSuffix, ids[1])
			}
		}

		items = append(items, &GenericDatasetItem{
			ID:       ID(itemID),
			Format:   item.Format,
			Name:     item.Name,
			URL:      item.URL,
			Layers:   item.Layers,
			ParentID: newID,
		})
	}

	_ = cityCode
	return &GenericDataset{
		ID:                newID,
		Name:              p.Name,
		Description:       p.Description,
		Year:              p.Year,
		Admin:             p.Admin,
		RegisterationYear: p.RegisterationYear,
		Groups:            p.Groups,
		OpenDataURL:       p.OpenDataURL,
		PrefectureID:      p.PrefectureID,
		PrefectureCode:    p.PrefectureCode,
		CityID:            p.CityID,
		CityCode:          p.CityCode,
		WardID:            p.WardID,
		WardCode:          p.WardCode,
		TypeID:            typeID,
		TypeCode:          typeCode,
		Items:             items,
	}
}

type Admin struct {
	Stage          string     `json:"stage,omitempty"`
	CMSURL         string     `json:"cmsUrl,omitempty"`
	CMSItemID      string     `json:"cmsItemId,omitempty"`
	CreatedAt      *time.Time `json:"createdAt,omitempty"`
	UpdatedAt      *time.Time `json:"updatedAt,omitempty"`
	SubAreaCode    string     `json:"subAreaCode,omitempty"`
	CityGMLAssetID string     `json:"cityGmlAssetId,omitempty"`
	CityGMLURLs    []string   `json:"cityGmlUrls,omitempty"`
	MaxLODURLs     []string   `json:"maxLodUrls,omitempty"`
}

func (a Admin) IsEmpty() bool {
	return a.Stage == "" &&
		a.CMSURL == "" &&
		a.CMSItemID == "" &&
		a.CreatedAt == nil &&
		a.UpdatedAt == nil &&
		a.SubAreaCode == "" &&
		a.CityGMLAssetID == "" &&
		len(a.CityGMLURLs) == 0 &&
		len(a.MaxLODURLs) == 0
}

func AdminFrom(a any) (admin Admin) {
	if a == nil {
		return
	}

	if a, ok := a.(*Admin); ok {
		if a != nil {
			return *a
		}
		return
	}

	if admin, ok := a.(Admin); ok {
		return admin
	}

	return
}

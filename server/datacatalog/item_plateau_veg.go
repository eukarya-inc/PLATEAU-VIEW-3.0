package datacatalog

func (i PlateauItem) VegItem(c PlateauIntermediateItem) *DataCatalogItem {
	return DataCatalogItemBuilder{
		Assets:           i.Veg,
		Description:      i.DescriptionVeg,
		ModelName:        "植生モデル",
		IntermediateItem: c,
		MultipleLOD:      true,
	}.Build()
}

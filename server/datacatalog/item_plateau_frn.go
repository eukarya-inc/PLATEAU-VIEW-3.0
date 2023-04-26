package datacatalog

func (i PlateauItem) FrnItem(c PlateauIntermediateItem) *DataCatalogItem {
	return DataCatalogItemBuilder{
		Assets:           i.Frn,
		Description:      i.DescriptionFrn,
		ModelName:        "都市設備モデル",
		IntermediateItem: c,
		MultipleLOD:      true,
	}.Build()
}

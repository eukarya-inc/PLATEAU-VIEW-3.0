package datacatalog

func (i PlateauItem) BridItem(c PlateauIntermediateItem) *DataCatalogItem {
	return DataCatalogItemBuilder{
		Assets:           i.Brid,
		Description:      i.DescriptionBrid,
		ModelName:        "橋梁モデル",
		IntermediateItem: c,
		MultipleLOD:      true,
		Layers:           []string{"brid"},
	}.Build()
}

func (i PlateauItem) RailItem(c PlateauIntermediateItem) *DataCatalogItem {
	return DataCatalogItemBuilder{
		Assets:           i.Rail,
		Description:      i.DescriptionRail,
		ModelName:        "鉄道モデル",
		IntermediateItem: c,
		MultipleLOD:      true,
		Layers:           []string{"rail"},
	}.Build()
}

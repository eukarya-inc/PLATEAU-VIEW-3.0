package geospatialjp

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cms"
)

type Status string

const (
	StatusReady      Status = "未実行"
	StatusProcessing Status = "実行中"
	StatusOK         Status = "完了"
	StatusError      Status = "エラー"
)

type Item struct {
	ID string `json:"id,omitempty"`
	// select: prefecture
	Prefecture string `json:"prefecture,omitempty"`
	// text: city_name
	CityName string `json:"city_name,omitempty"`
	// asset: citygml
	CityGML string `json:"citygml,omitempty"`
	// asset: citygml_geospatialjp
	CityGMLGeoSpatialJP string `json:"citygml_geospatialjp,omitempty"`
	// asset: catalog
	Catalog string `json:"catalog,omitempty"`
	// asset: all
	All string `json:"all,omitempty"`
	// select: conversion_status: 未実行, 実行中, 完了, エラー
	ConversionStatus Status `json:"conversion_status,omitempty"`
	// select: catalog_status: 未実行, 実行中, 完了, エラー
	CatalogStatus Status `json:"catalog_status,omitempty"`
}

func (i Item) Fields() (fields []cms.Field) {
	if i.Prefecture != "" {
		fields = append(fields, cms.Field{
			Key:   "prefecture",
			Type:  "select",
			Value: i.Prefecture,
		})
	}

	if i.CityName != "" {
		fields = append(fields, cms.Field{
			Key:   "city_name",
			Type:  "text",
			Value: i.CityName,
		})
	}

	if i.CityGML != "" {
		fields = append(fields, cms.Field{
			Key:   "citygml",
			Type:  "asset",
			Value: i.CityGML,
		})
	}

	if i.CityGMLGeoSpatialJP != "" {
		fields = append(fields, cms.Field{
			Key:   "citygml_geospatialjp",
			Type:  "asset",
			Value: i.CityGMLGeoSpatialJP,
		})
	}

	if i.Catalog != "" {
		fields = append(fields, cms.Field{
			Key:   "catalog",
			Type:  "asset",
			Value: i.Catalog,
		})
	}

	if i.All != "" {
		fields = append(fields, cms.Field{
			Key:   "all",
			Type:  "asset",
			Value: i.All,
		})
	}

	if i.ConversionStatus != "" {
		fields = append(fields, cms.Field{
			Key:   "conversion_status",
			Type:  "select",
			Value: string(i.ConversionStatus),
		})
	}

	if i.CatalogStatus != "" {
		fields = append(fields, cms.Field{
			Key:   "catalog_status",
			Type:  "select",
			Value: string(i.CatalogStatus),
		})
	}

	return
}

func ItemFrom(item cms.Item) (i Item) {
	i.ID = item.ID

	if v := item.FieldByKey("prefecture").ValueString(); v != nil {
		i.Prefecture = *v
	}

	if v := item.FieldByKey("city_name").ValueString(); v != nil {
		i.CityName = *v
	}

	if v := item.FieldByKey("citygml").ValueString(); v != nil {
		i.CityGML = *v
	}

	if v := item.FieldByKey("citygml_geospatialjp").ValueString(); v != nil {
		i.CityGMLGeoSpatialJP = *v
	}

	if v := item.FieldByKey("catalog").ValueString(); v != nil {
		i.Catalog = *v
	}

	if v := item.FieldByKey("all").ValueString(); v != nil {
		i.All = *v
	}

	if v := item.FieldByKey("conversion_status").ValueString(); v != nil {
		i.ConversionStatus = Status(*v)
	}

	if v := item.FieldByKey("catalog_status").ValueString(); v != nil {
		i.CatalogStatus = Status(*v)
	}

	return
}

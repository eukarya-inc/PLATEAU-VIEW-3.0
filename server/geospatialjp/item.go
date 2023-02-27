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
	ID string `json:"id,omitempty" cms:"id"`
	// select: specification
	Specification string `json:"specification,omitempty" cms:"specification,select"`
	// select: prefecture
	Prefecture string `json:"prefecture,omitempty" cms:"prefecture,select"`
	// text: city_name
	CityName string `json:"city_name,omitempty" cms:"city_name,text"`
	// asset: citygml
	CityGML string `json:"citygml,omitempty" cms:"citygml,asset"`
	// asset: citygml_geospatialjp
	CityGMLGeoSpatialJP string `json:"citygml_geospatialjp,omitempty" cms:"citygml_geospatialjp,asset"`
	// asset: catalog
	Catalog string `json:"catalog,omitempty" cms:"catalog,asset"`
	// asset: all
	All string `json:"all,omitempty" cms:"all,asset"`
	// select: conversion_status: 未実行, 実行中, 完了, エラー
	ConversionStatus Status `json:"conversion_status,omitempty" cms:"conversion_status,select"`
	// select: catalog_status: 未実行, 実行中, 完了, エラー
	CatalogStatus Status `json:"catalog_status,omitempty" cms:"catalog_status,select"`
}

func (i Item) Fields() (fields []cms.Field) {
	item := &cms.Item{}
	cms.Marshal(i, item)
	return item.Fields
}

func ItemFrom(item cms.Item) (i Item) {
	item.Unmarshal(&i)
	return
}

package cmsintegration

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
)

type Status string

const (
	StatusReady      Status = "未実行"
	StatusProcessing Status = "実行中"
	StatusOK         Status = "完了"
	StatusError      Status = "エラー"
)

type Conversion string

const (
	ConversionDisabled Conversion = "変換しない"
	ConversionEnabled  Conversion = "変換する"
)

func (s Conversion) Enabled() bool {
	return s == ConversionEnabled
}

type Separation string

func (s Separation) Enabled() bool {
	return string(s) != "分割しない"
}

type PRCS string

var prcsRegexp = regexp.MustCompile(`([0-9]+)系`)

func (s PRCS) ESPGCode() string {
	m := prcsRegexp.FindStringSubmatch(string(s))
	if len(m) != 2 {
		return ""
	}

	c, err := strconv.Atoi(m[1])
	if err != nil {
		return ""
	}

	return fmt.Sprintf("%d", 6668+c)
}

type Item struct {
	ID string `json:"id,omitempty"`
	// select: prefecture
	Prefecture string `json:"prefecture,omitempty"`
	// text: city_name
	CityName string `json:"city_name,omitempty"`
	// select: specification
	Specification string `json:"specification,omitempty"`
	// asset: citygml
	CityGML string `json:"citygml,omitempty"`
	// asset: citygml_geospatialjp
	CityGMLGeoSpatialJP string `json:"citygml_geospatialjp,omitempty"`
	// asset: catalog
	Catalog string `json:"catalog,omitempty"`
	// select: conversion_enabled: 変換する, 変換しない
	ConversionEnabled Conversion `json:"conversion_enabled,omitempty"`
	// select: prcs: 第1系~第19系
	PRCS PRCS `json:"prcs"`
	// asset: quality_check_params
	QualityCheckParams string `json:"quality_check_params,omitempty"`
	// select: devide_odc: 分割する, 分割しない
	DevideODC Separation `json:"devide_odc,omitempty"`
	// asset[]: bldg
	Bldg []string `json:"bldg,omitempty"`
	// asset: tran
	Tran []string `json:"tran,omitempty"`
	// asset: frn
	Frn []string `json:"frn,omitempty"`
	// asset: veg
	Veg []string `json:"veg,omitempty"`
	// asset: luse
	Luse []string `json:"luse,omitempty"`
	// asset: lsld
	Lsld []string `json:"lsld,omitempty"`
	// asset: urf
	Urf []string `json:"urf,omitempty"`
	// asset[]: fld
	Fld []string `json:"fld,omitempty"`
	// asset[]: tnm
	Tnm []string `json:"tnm,omitempty"`
	// asset[]: htd
	Htd []string `json:"htd,omitempty"`
	// asset[]: ifld
	Ifld []string `json:"ifld,omitempty"`
	// asset: all
	All string `json:"all,omitempty"`
	// asset: dictionary
	Dictionary string `json:"dictionary,omitempty"`
	// select: conversion_status: 未実行, 実行中, 完了, エラー
	ConversionStatus Status `json:"conversion_status,omitempty"`
	// select: catalog_status: 未実行, 実行中, 完了, エラー
	CatalogStatus Status `json:"catalog_status,omitempty"`
	// asset: max_lod
	MaxLOD string `json:"max_lod,omitempty"`
	// select: max_lod_status: 未実行, 実行中, 完了, エラー
	MaxLODStatus Status `json:"max_lod_status,omitempty"`
	// asset: search_index
	SearchIndex []string `json:"search_index,omitempty"`
	// select: search_index_status: 未実行, 実行中, 完了, エラー
	SeatchIndexStatus Status `json:"search_index_status,omitempty"`
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

	if i.Specification != "" {
		fields = append(fields, cms.Field{
			Key:   "specification",
			Type:  "text",
			Value: i.Specification,
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

	if i.ConversionEnabled != "" {
		fields = append(fields, cms.Field{
			Key:   "conversion_enabled",
			Type:  "select",
			Value: string(i.ConversionEnabled),
		})
	}

	if i.PRCS != "" {
		fields = append(fields, cms.Field{
			Key:   "prcs",
			Type:  "select",
			Value: string(i.PRCS),
		})
	}

	if i.QualityCheckParams != "" {
		fields = append(fields, cms.Field{
			Key:   "quality_check_params",
			Type:  "asset",
			Value: i.QualityCheckParams,
		})
	}

	if i.DevideODC != "" {
		fields = append(fields, cms.Field{
			Key:   "devide_odc",
			Type:  "select",
			Value: string(i.DevideODC),
		})
	}

	if i.Bldg != nil {
		fields = append(fields, cms.Field{
			Key:   "bldg",
			Type:  "asset",
			Value: i.Bldg,
		})
	}

	if i.Tran != nil {
		fields = append(fields, cms.Field{
			Key:   "tran",
			Type:  "asset",
			Value: i.Tran,
		})
	}

	if i.Frn != nil {
		fields = append(fields, cms.Field{
			Key:   "frn",
			Type:  "asset",
			Value: i.Frn,
		})
	}

	if i.Veg != nil {
		fields = append(fields, cms.Field{
			Key:   "veg",
			Type:  "asset",
			Value: i.Veg,
		})
	}

	if i.Luse != nil {
		fields = append(fields, cms.Field{
			Key:   "luse",
			Type:  "asset",
			Value: i.Luse,
		})
	}

	if i.Lsld != nil {
		fields = append(fields, cms.Field{
			Key:   "lsld",
			Type:  "asset",
			Value: i.Lsld,
		})
	}

	if i.Urf != nil {
		fields = append(fields, cms.Field{
			Key:   "urf",
			Type:  "asset",
			Value: i.Urf,
		})
	}

	if i.Fld != nil {
		fields = append(fields, cms.Field{
			Key:   "fld",
			Type:  "asset",
			Value: i.Fld,
		})
	}

	if i.Tnm != nil {
		fields = append(fields, cms.Field{
			Key:   "tnm",
			Type:  "asset",
			Value: i.Tnm,
		})
	}

	if i.Htd != nil {
		fields = append(fields, cms.Field{
			Key:   "htd",
			Type:  "asset",
			Value: i.Htd,
		})
	}

	if i.Ifld != nil {
		fields = append(fields, cms.Field{
			Key:   "ifld",
			Type:  "asset",
			Value: i.Ifld,
		})
	}

	if i.All != "" {
		fields = append(fields, cms.Field{
			Key:   "all",
			Type:  "asset",
			Value: i.All,
		})
	}

	if i.Dictionary != "" {
		fields = append(fields, cms.Field{
			Key:   "dictionary",
			Type:  "asset",
			Value: i.Dictionary,
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

	if i.MaxLOD != "" {
		fields = append(fields, cms.Field{
			Key:   "max_lod",
			Type:  "asset",
			Value: i.MaxLOD,
		})
	}

	if i.MaxLODStatus != "" {
		fields = append(fields, cms.Field{
			Key:   "max_lod_status",
			Type:  "select",
			Value: string(i.MaxLODStatus),
		})
	}

	if i.SearchIndex != nil {
		fields = append(fields, cms.Field{
			Key:   "search_index",
			Type:  "asset",
			Value: i.SearchIndex,
		})
	}

	if i.SeatchIndexStatus != "" {
		fields = append(fields, cms.Field{
			Key:   "search_index_status",
			Type:  "select",
			Value: string(i.SeatchIndexStatus),
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

	if v := item.FieldByKey("specification").ValueString(); v != nil {
		i.Specification = *v
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

	if v := item.FieldByKey("conversion_enabled").ValueString(); v != nil {
		i.ConversionEnabled = Conversion(*v)
	}

	if v := item.FieldByKey("prcs").ValueString(); v != nil {
		i.PRCS = PRCS(*v)
	}

	if v := item.FieldByKey("quality_check_params").ValueString(); v != nil {
		i.QualityCheckParams = *v
	}

	if v := item.FieldByKey("devide_odc").ValueString(); v != nil {
		i.DevideODC = Separation(*v)
	}

	if v := item.FieldByKey("bldg").ValueStrings(); v != nil {
		i.Bldg = v
	}

	if v := item.FieldByKey("tran").ValueStrings(); v != nil {
		i.Tran = v
	}

	if v := item.FieldByKey("frn").ValueStrings(); v != nil {
		i.Frn = v
	}

	if v := item.FieldByKey("veg").ValueStrings(); v != nil {
		i.Veg = v
	}

	if v := item.FieldByKey("luse").ValueStrings(); v != nil {
		i.Luse = v
	}

	if v := item.FieldByKey("lsld").ValueStrings(); v != nil {
		i.Lsld = v
	}

	if v := item.FieldByKey("urf").ValueStrings(); v != nil {
		i.Urf = v
	}

	if v := item.FieldByKey("fld").ValueStrings(); v != nil {
		i.Fld = v
	}

	if v := item.FieldByKey("tnm").ValueStrings(); v != nil {
		i.Tnm = v
	}

	if v := item.FieldByKey("htd").ValueStrings(); v != nil {
		i.Htd = v
	}

	if v := item.FieldByKey("ifld").ValueStrings(); v != nil {
		i.Ifld = v
	}

	if v := item.FieldByKey("all").ValueString(); v != nil {
		i.All = *v
	}

	if v := item.FieldByKey("dictionary").ValueString(); v != nil {
		i.Dictionary = *v
	}

	if v := item.FieldByKey("conversion_status").ValueString(); v != nil {
		i.ConversionStatus = Status(*v)
	}

	if v := item.FieldByKey("catalog_status").ValueString(); v != nil {
		i.CatalogStatus = Status(*v)
	}

	if v := item.FieldByKey("max_lod").ValueString(); v != nil {
		i.MaxLOD = *v
	}

	if v := item.FieldByKey("max_lod_status").ValueString(); v != nil {
		i.MaxLODStatus = Status(*v)
	}

	if v := item.FieldByKey("search_index").ValueStrings(); v != nil {
		i.SearchIndex = v
	}

	if v := item.FieldByKey("search_index_status").ValueString(); v != nil {
		i.SeatchIndexStatus = Status(*v)
	}

	return
}

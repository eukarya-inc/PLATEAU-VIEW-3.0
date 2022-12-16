package geospatialjp

import (
	"fmt"
	"strings"

	"github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/xuri/excelize/v2"
)

type Catalogue struct {
	// タイトル
	Title string `json:"title"`
	// URL
	URL string `json:"url"`
	// 説明
	Description string `json:"description"`
	// タグ
	Tags []string `json:"tags"`
	// ライセンス
	License string `json:"license"`
	// 組織
	Organization string `json:"organization"`
	// 公開・非公開
	Public string `json:"public"`
	// ソース
	Source string `json:"source"`
	// バージョン
	Version string `json:"version"`
	// 作成者
	Author string `json:"author"`
	// 作成者のメールアドレス
	AuthorEmail string `json:"authorEmail"`
	// メンテナー（保守者）
	Maintainer string `json:"maintainer"`
	// メンテナー（保守者）のメールアドレス
	MaintainerEmail string `json:"maintainerEmail"`
	// spatial*
	Spatial string `json:"spatial"`
	// データ品質
	DataQuality string `json:"dataQuality"`
	// 制約
	Constraints string `json:"constraints"`
	// データ登録日
	RegisteredAt string `json:"registeredAt"`
	// 有償無償区分*
	FreeOrProvidedClassification string `json:"freeOrProvidedClassification"`
	// 災害時区分*
	DisasterClassification string `json:"disasterClassification"`
	// 地理的範囲
	GeoArea string `json:"geoArea"`
	// サムネイル画像
	Thumbnail []byte `json:"-"`
	// サムネイル画像のファイル名
	ThumbnailFileName string `json:"-"`
	// 価格情報
	Price string `json:"price"`
	// 使用許諾
	LicenseAgreement string `json:"licenseAgreement"`
	// カスタムフィールド
	CustomFields map[string]any `json:"customFields"`
}

type CatalogueFile struct {
	file *excelize.File
}

func NewCatalogueFile(file *excelize.File) *CatalogueFile {
	return &CatalogueFile{
		file: file,
	}
}

func (c *CatalogueFile) Parse() (res Catalogue, err error) {
	sheet, err := c.getSheet()
	if err != nil {
		return res, err
	}

	errs := []error{}

	res.Title, errs = c.getCellValue(sheet, "タイトル", "D2", errs)
	res.URL, errs = c.getCellValue(sheet, "URL", "D3", errs)
	res.Description, errs = c.getCellValue(sheet, "説明", "D4", errs)
	res.Tags, errs = c.getCellValueAsTags(sheet, "タグ", "D5", errs)
	res.License, errs = c.getCellValue(sheet, "ライセンス", "D6", errs)
	res.Organization, errs = c.getCellValue(sheet, "組織", "D7", errs)
	res.Public, errs = c.getCellValue(sheet, "公開・非公開", "D8", errs)
	res.Source, errs = c.getCellValue(sheet, "ソース", "D9", errs)
	res.Version, errs = c.getCellValue(sheet, "バージョン", "D10", errs)
	res.Author, errs = c.getCellValue(sheet, "作成者", "D11", errs)
	res.AuthorEmail, errs = c.getCellValue(sheet, "作成者のメールアドレス", "D12", errs)
	res.Maintainer, errs = c.getCellValue(sheet, "メンテナー（保守者）", "D13", errs)
	res.MaintainerEmail, errs = c.getCellValue(sheet, "メンテナー（保守者）のメールアドレス", "D14", errs)
	res.Spatial, errs = c.getCellValue(sheet, "spatial*", "D15", errs)
	res.DataQuality, errs = c.getCellValue(sheet, "データ品質", "D16", errs)
	res.Constraints, errs = c.getCellValue(sheet, "制約", "D17", errs)
	res.RegisteredAt, errs = c.getCellValue(sheet, "データ登録日", "D18", errs)
	res.FreeOrProvidedClassification, errs = c.getCellValue(sheet, "有償無償区分*", "D19", errs)
	res.DisasterClassification, errs = c.getCellValue(sheet, "災害時区分*", "D20", errs)
	res.GeoArea, errs = c.getCellValue(sheet, "地理的範囲", "D21", errs)
	res.ThumbnailFileName, res.Thumbnail, errs = c.getPicture(sheet, "サムネイル画像", "D22", errs)
	res.Price, errs = c.getCellValue(sheet, "価格情報", "D23", errs)
	res.LicenseAgreement, errs = c.getCellValue(sheet, "使用許諾", "D24", errs)
	// TODO: メタデータ is not implemented yet

	if len(errs) > 0 {
		return res, fmt.Errorf("目録のパースに失敗しました。%w", errorsJoin(errs))
	}
	return res, nil
}

func (c *CatalogueFile) getSheet() (string, error) {
	if i := c.file.GetSheetIndex("G空間登録用メタデータ "); i < 0 {
		if i = c.file.GetSheetIndex("G空間登録用メタデータ"); i < 0 {
			return "", errors.New("シート「G空間登録用メタデータ」が見つかりませんでした。")
		}
		return "G空間登録用メタデータ", nil
	}
	return "G空間登録用メタデータ ", nil
}

func (c *CatalogueFile) getCellValue(sheet, name, _axis string, errs []error) (string, []error) {
	pos, errs := c.findCell(sheet, name, errs)
	if pos != "" {
		cp, err := ParseCellPos(pos)
		if err != nil {
			return "", append(errs, err)
		}
		pos = cp.ShiftX(2).String()
	}

	cell, err := c.file.GetCellValue(sheet, pos)
	if err != nil {
		return "", append(errs, fmt.Errorf("「%s」が見つかりませんでした。", name))
	}
	return cell, nil
}

func (c *CatalogueFile) getCellValueAsTags(sheet, name, axis string, errs []error) ([]string, []error) {
	cell, errs := c.getCellValue(sheet, name, axis, errs)
	tags := lo.Map(
		lo.FlatMap(
			strings.Split(cell, ","),
			func(s string, _ int) []string {
				return strings.Split(s, "、")
			}),
		func(s string, _ int) string {
			return strings.TrimSpace(s)
		},
	)
	return tags, errs
}

func (c *CatalogueFile) getPicture(sheet, name, axis string, errs []error) (string, []byte, []error) {
	file, raw, err := c.file.GetPicture(sheet, axis)
	if err != nil {
		return "", nil, append(errs, fmt.Errorf("「%s」が見つかりませんでした。", name))
	}
	return file, raw, errs
}

func (c *CatalogueFile) findCell(sheet, name string, errs []error) (string, []error) {
	pos, err := c.file.SearchSheet(sheet, name)
	if err != nil || len(pos) == 0 {
		return "", append(errs, fmt.Errorf("「%s」が見つかりませんでした。", name))
	}
	return pos[0], nil
}

func errorsJoin(errs []error) error {
	return errors.New(strings.Join(lo.Map(errs, func(e error, _ int) string { return e.Error() }), ""))
}

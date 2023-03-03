package geospatialjp

import (
	"net/http"
	"net/url"
	"path"
	"regexp"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/geospatialjp/ckan"
	"github.com/pkg/errors"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/vincent-petithory/dataurl"
)

const (
	ResourceNameCityGML = "CityGML（v2）"
	ResourceNameAll     = "3D Tiles, MVT（v2）"
	ResourceNameCatalog = "データ目録（v2）"
	licenseDefaultID    = "plateau"
	licenseDefaultTitle = "PLATEAU Site Policy 「３．著作権について」に拠る"
	licenseDefaultURL   = "https://www.mlit.go.jp/plateau/site-policy/"
	LicenseOL           = "独自利用規約"
	licenseOLID         = "ol"
)

// 仕様書バージョンと年度
var specNendoYearMap = map[string]int{
	"第2.3版": 2022, // 2022年度
}

var reFileName = regexp.MustCompile(`^([0-9]+?)_(.+?)_`)

func findResource(pkg *ckan.Package, name, format, desc, url string) (_ ckan.Resource, needUpdate bool) {
	r, found := lo.Find(pkg.Resources, func(r ckan.Resource) bool {
		return r.Name == name
	})
	if !found {
		r = ckan.Resource{
			PackageID:   pkg.ID,
			Name:        name,
			Format:      format,
			Description: desc,
		}
		needUpdate = true
	}
	if url != "" && r.URL != url {
		r.URL = url
		needUpdate = true
	}
	return r, needUpdate
}

func extractCityName(fn string) (string, string, error) {
	u, err := url.Parse(fn)
	if err != nil {
		return "", "", err
	}

	base := path.Base(u.Path)
	s := reFileName.FindStringSubmatch(base)
	if s == nil {
		return "", "", errors.New("invalid file name")
	}

	return s[1], s[2], nil
}

func packageFromCatalog(c Catalog, org, pkgName string, private bool) ckan.Package {
	var thumbnailURL string
	if c.Thumbnail != nil {
		thumbnailURL = dataurl.New(c.Thumbnail, http.DetectContentType(c.Thumbnail)).String()
	}

	var licenseID, licenseURL, licenseTitle string
	if c.License != LicenseOL {
		licenseID = licenseOLID
		licenseTitle = LicenseOL
	} else {
		licenseID = licenseDefaultID
		licenseURL = licenseDefaultURL
		licenseTitle = licenseDefaultTitle
	}

	return ckan.Package{
		Name:            pkgName,
		Title:           c.Title,
		Private:         private || c.Public != "パブリック",
		Author:          c.Author,
		AuthorEmail:     c.AuthorEmail,
		Maintainer:      c.Maintainer,
		MaintainerEmail: c.MaintainerEmail,
		Notes:           c.Notes,
		Version:         c.Version,
		Tags: lo.Map(c.Tags, func(t string, _ int) ckan.Tag {
			return ckan.Tag{Name: t}
		}),
		OwnerOrg:         org,
		Restriction:      c.Restriction,
		Charge:           c.Charge,
		RegisterdDate:    c.RegisteredDate,
		LicenseAgreement: c.LicenseAgreement,
		LicenseTitle:     licenseTitle,
		LicenseURL:       licenseURL,
		LicenseID:        licenseID,
		Fee:              c.Fee,
		Area:             c.Area,
		Quality:          c.Quality,
		Emergency:        c.Emergency,
		URL:              c.Source,
		Spatial:          c.Spatial,
		ThumbnailURL:     thumbnailURL,
		// unused: URL: c.URL (empty), 組織: c.Organization (no field)
	}
}

func nendo(s string) int {
	if y, ok := specNendoYearMap[s]; ok {
		return y
	}

	// Asia/Tokyo: UTC+09:00
	jptime := util.Now().UTC().Add(time.Hour * 9)
	return jptime.AddDate(0, -3, 0).Year()
}

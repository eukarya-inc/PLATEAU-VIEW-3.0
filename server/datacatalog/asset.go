package datacatalog

import (
	"path"
	"regexp"
	"strings"

	"github.com/samber/lo"
)

var reAssetName = regexp.MustCompile(`^([0-9]+?)_(.+?)_(.+?)_(.+?)_(.+?_op.*?)(?:_(.+?)(?:_(.+))?)?$`)
var reLod = regexp.MustCompile(`_lod([0-9\.]+?)`)
var reWard = regexp.MustCompile(`^([0-9]+?)_(.+?)_`)

type AssetName struct {
	CityCode       string
	CityEn         string
	Year           string
	Format         string
	Op             string
	Feature        string
	Ex             string
	Ext            string
	WardCode       string
	WardEn         string
	LOD            string
	LowTexture     bool
	NoTexture      bool
	FldCategory    string
	FldName        string
	UrfFeatureType string
}

func AssetNameFrom(name string) (a AssetName) {
	a.Ext = path.Ext(name)
	name = strings.TrimSuffix(name, a.Ext)
	name = path.Base(name)
	m := reAssetName.FindStringSubmatch(name)
	if len(m) < 2 {
		return
	}

	a.CityCode = m[1]
	a.CityEn = m[2]
	a.Year = m[3]
	a.Format = m[4]
	a.Op = m[5]
	if len(m) > 6 {
		a.Feature = m[6]
		if len(m) > 7 {
			a.Ex = m[7]
		}
	}

	lodm := reLod.FindStringSubmatch(a.Ex)
	if len(lodm) >= 2 {
		a.LOD = lodm[1]
	}

	wardm := reWard.FindStringSubmatch(a.Ex)
	if len(wardm) >= 2 {
		a.WardCode = wardm[1]
		a.WardEn = wardm[2]
	}

	a.LowTexture = strings.Contains(a.Ex, "_low_texture")
	a.NoTexture = strings.Contains(a.Ex, "_no_texture")

	if a.Feature == "urf" {
		a.UrfFeatureType = a.Ex
	} else if a.Feature == "fld" || a.Feature == "htd" || a.Feature == "ifld" || a.Feature == "tnm" {
		fldCategory, fldName, found := strings.Cut(a.Ex, "_")
		if found {
			a.FldCategory = fldCategory
			a.FldName = fldName
		} else {
			a.FldName = a.Ex
		}
	}

	return
}

func (a AssetName) String() string {
	return strings.Join(lo.Filter([]string{
		a.CityCode,
		a.CityEn,
		a.Year,
		a.Format,
		a.Op,
		a.Feature,
		a.Ex,
	}, func(s string, _ int) bool { return s != "" }), "_") + a.Ext
}

func (a AssetName) IsWard() bool {
	return a.WardCode != ""
}

func (a AssetName) CityOrWardCode() string {
	if a.IsWard() {
		return a.WardCode
	}
	return a.CityCode
}

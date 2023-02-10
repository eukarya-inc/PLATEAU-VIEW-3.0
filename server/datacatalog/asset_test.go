package datacatalog

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAssetNameFrom(t *testing.T) {
	assert.Equal(t, AssetName{
		CityCode: "13229",
		CityEn:   "nishitokyo-shi",
		Year:     "2022",
		Format:   "citygml",
		Op:       "1_op",
		Ext:      ".zip",
	}, AssetNameFrom("https://example.com/12345/13229_nishitokyo-shi_2022_citygml_1_op.zip"))

	assert.Equal(t, AssetName{
		CityCode:    "13229",
		CityEn:      "nishitokyo-shi",
		Year:        "2022",
		Format:      "3dtiles",
		Op:          "1_op2",
		Feature:     "fld",
		Ex:          "pref_shakujiigawa-shirakogawa_op",
		Ext:         ".zip",
		FldCategory: "pref",
		FldName:     "shakujiigawa-shirakogawa_op",
	}, AssetNameFrom("13229_nishitokyo-shi_2022_3dtiles_1_op2_fld_pref_shakujiigawa-shirakogawa_op.zip"))

	assert.Equal(t, AssetName{
		CityCode:  "13100",
		CityEn:    "tokyo23-ku",
		Year:      "2020",
		Format:    "3dtiles",
		Op:        "4_2_op",
		Feature:   "bldg",
		Ex:        "13109_shinagawa-ku_lod2_no_texture",
		Ext:       ".zip",
		WardCode:  "13109",
		WardEn:    "shinagawa-ku",
		LOD:       "2",
		NoTexture: true,
	}, AssetNameFrom("13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13109_shinagawa-ku_lod2_no_texture.zip"))

	assert.Equal(t, AssetName{
		CityCode:       "23212",
		CityEn:         "anjo-shi",
		Year:           "2020",
		Format:         "mvt",
		Op:             "4_op",
		Feature:        "urf",
		Ex:             "UseDistrict",
		Ext:            ".zip",
		UrfFeatureType: "UseDistrict",
	}, AssetNameFrom("23212_anjo-shi_2020_mvt_4_op_urf_UseDistrict.zip"))

	assert.Equal(t, AssetName{
		CityCode:    "13100",
		CityEn:      "tokyo23-ku",
		Year:        "2020",
		Format:      "3dtiles",
		Op:          "4_2_op",
		Feature:     "fld",
		Ex:          "natl_tmagawa_tamagawa-asakawa-etc_op",
		Ext:         ".zip",
		FldCategory: "natl",
		FldName:     "tmagawa_tamagawa-asakawa-etc_op",
	}, AssetNameFrom("13100_tokyo23-ku_2020_3dtiles_4_2_op_fld_natl_tmagawa_tamagawa-asakawa-etc_op.zip"))

	assert.Equal(t, AssetName{
		CityCode: "14130",
		CityEn:   "kawasaki-shi",
		Year:     "2022",
		Format:   "3dtiles",
		Op:       "1_op",
		Feature:  "frn",
		Ext:      ".zip",
	}, AssetNameFrom("14130_kawasaki-shi_2022_3dtiles_1_op_frn.zip"))
}

func TestAssetName_String(t *testing.T) {
	assert.Equal(t, "13229_nishitokyo-shi_2022_citygml_1_op.zip", AssetName{
		CityCode: "13229",
		CityEn:   "nishitokyo-shi",
		Year:     "2022",
		Format:   "citygml",
		Op:       "1_op",
		Ext:      ".zip",
	}.String())

	assert.Equal(t, "13229_nishitokyo-shi_2022_3dtiles_1_op2_fld_pref_shakujiigawa-shirakogawa_op.zip", AssetName{
		CityCode: "13229",
		CityEn:   "nishitokyo-shi",
		Year:     "2022",
		Format:   "3dtiles",
		Op:       "1_op2",
		Feature:  "fld",
		Ex:       "pref_shakujiigawa-shirakogawa_op",
		Ext:      ".zip",
	}.String())

	assert.Equal(t, "13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13109_shinagawa-ku_lod2_no_texture.zip", AssetName{
		CityCode:  "13100",
		CityEn:    "tokyo23-ku",
		Year:      "2020",
		Format:    "3dtiles",
		Op:        "4_2_op",
		Feature:   "bldg",
		Ex:        "13109_shinagawa-ku_lod2_no_texture",
		Ext:       ".zip",
		WardCode:  "13109",
		WardEn:    "shinagawa-ku",
		LOD:       "2",
		NoTexture: true,
	}.String())

	assert.Equal(t, "23212_anjo-shi_2020_mvt_4_op_urf_UseDistrict.zip", AssetName{
		CityCode:       "23212",
		CityEn:         "anjo-shi",
		Year:           "2020",
		Format:         "mvt",
		Op:             "4_op",
		Feature:        "urf",
		Ex:             "UseDistrict",
		Ext:            ".zip",
		UrfFeatureType: "UseDistrict",
	}.String())

	assert.Equal(t, "14130_kawasaki-shi_2022_3dtiles_1_op_frn.zip", AssetName{
		CityCode: "14130",
		CityEn:   "kawasaki-shi",
		Year:     "2022",
		Format:   "3dtiles",
		Op:       "1_op",
		Feature:  "frn",
		Ext:      ".zip",
	}.String())
}

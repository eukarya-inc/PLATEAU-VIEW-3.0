package datacatalog

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/stretchr/testify/assert"
)

func TestMaxLOD(t *testing.T) {
	a, l := maxLOD([]*cms.PublicAsset{
		{URL: "43204_arao-shi_2020_mvt_5_op_tran_lod1.zip"},
		{URL: "43204_arao-shi_2020_mvt_5_op_tran_lod2.zip"},
	})
	assert.Equal(t, &cms.PublicAsset{
		URL: "43204_arao-shi_2020_mvt_5_op_tran_lod2.zip",
	}, a)
	assert.Equal(t, 2, l)
	a, l = maxLOD([]*cms.PublicAsset{
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod1.zip"},
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2.zip"},
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod3.zip"},
	})
	assert.Equal(t, &cms.PublicAsset{
		URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod3.zip",
	}, a)
	assert.Equal(t, 3, l)
}

func TestMaxLODBldg(t *testing.T) {
	assert.Equal(t, &BldgSet{
		LOD:        2,
		Texture:    &cms.PublicAsset{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2.zip"},
		LowTexture: &cms.PublicAsset{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2_low_texture.zip"},
		NoTexture:  &cms.PublicAsset{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2_no_texture.zip"},
	}, maxLODBldg([]*cms.PublicAsset{
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod1.zip"},
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2.zip"},
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2_low_texture.zip"},
		{URL: "https://example.com/13100_tokyo23-ku_2020_3dtiles_4_2_op_bldg_13102_chuo-ku_lod2_no_texture.zip"},
	}))
}

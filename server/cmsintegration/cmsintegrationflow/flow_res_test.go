package cmsintegrationflow

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFlowResult_Internal(t *testing.T) {
	id := ID{
		ItemID:      "item",
		ProjectID:   "project",
		FeatureType: "bldg",
	}.Sign("secret")

	r := FlowResult{
		TriggerID:    "trigger",
		RunID:        "run",
		DeploymentID: "deployment",
		Status:       "succeeded",
		Logs:         []string{"https://example.com/logs.log"},
		Outputs: []string{
			"https://example.com/dic.json",
			"https://example.com/maxlod.csv",
			"https://example.com/qc_result.zip",
			"https://example.com/qc_result_succeeded",
			"https://example.com/13999_hoge-shi_citygml_op_1_bldg_3dtiles_lod1.zip",
			"https://example.com/13999_hoge-shi_citygml_op_1_bldg_3dtiles_lod2.zip",
			"https://example.com/13999_hoge-shi_citygml_op_1_bldg_3dtiles_lod2_no_texture.zip",
		},
		ID: id,
	}

	expected := FlowInternalResult{
		Conv: map[string][]string{
			"hoge-shi_citygml_op_1_bldg_3dtiles": {
				"https://example.com/13999_hoge-shi_citygml_op_1_bldg_3dtiles_lod1.zip",
				"https://example.com/13999_hoge-shi_citygml_op_1_bldg_3dtiles_lod2.zip",
				"https://example.com/13999_hoge-shi_citygml_op_1_bldg_3dtiles_lod2_no_texture.zip",
			},
		},
		Dic:      "https://example.com/dic.json",
		MaxLOD:   "https://example.com/maxlod.csv",
		QCResult: "https://example.com/qc_result.zip",
		QCOK:     true,
	}

	res := r.Internal()
	assert.Equal(t, expected, res)
}

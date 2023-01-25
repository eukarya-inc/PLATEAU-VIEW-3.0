package main

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const borderName = "11238_hasuda-shi_border"

const border = `{
	"type" : "FeatureCollection",
	"name" : "11238_hasuda-shi_border",
	"features" : [
		{
			"type" : "Feature",
			"geometry" : {
				"type" : "Polygon",
				"coordinates" : [
					[
						[ 139.6050448421, 36.0366165201 ],
						[ 139.6048803941, 36.0366387451 ],
						[ 139.604250394, 36.0367901312 ],
						[ 139.6050448421, 36.0366165201 ]
					]
				]
			},
			"properties" : {
				"prefecture_code" : "11",
				"prefecture_name" : "埼玉県",
				"city_code" : "11238",
				"city_name" : "蓮田市"
			}
		}
	]
}`

var expectedBorder = `[
	{
    "id": "document",
		"name": "11238_hasuda-shi_border",
    "version": "1.0"
  },
  {
    "id": "11238_hasuda-shi_border_1",
    "wall": {
      "material": {
        "image": {
					"image": "` + wallImageDataURL + `",
          "repeat": true,
          "transparent": true
        }
      },
      "positions": {
        "cartographicDegrees": [
					139.6050448421,
					36.0366165201,
					100,
					139.6048803941,
					36.0366387451,
					100,
					139.604250394,
					36.0367901312,
					100,
					139.6050448421,
					36.0366165201,
					100
				]
			}
		},
		"properties" : {
			"prefecture_code" : "11",
			"prefecture_name" : "埼玉県",
			"city_code" : "11238",
			"city_name" : "蓮田市"
		}
	}
]`

func TestConvert_Execute(t *testing.T) {
	fs := afero.NewMemMapFs()
	_ = afero.WriteFile(fs, borderName+".geojson", []byte(border), 0666)

	require.NoError(t, (&Convert{
		InputFS:  fs,
		OutputFS: fs,
	}).execute())

	var expectedBorderJSON any
	var actualBorderJSON any
	assert.NoError(t, json.Unmarshal([]byte(expectedBorder), &expectedBorderJSON))
	assert.NoError(t, json.Unmarshal(lo.Must(afero.ReadFile(fs, borderName+".czml")), &actualBorderJSON))

	assert.Equal(t, expectedBorderJSON, actualBorderJSON)
}

func TestGenerateLandmarkImage(t *testing.T) {
	image, err := GenerateLandmarkImage("日本カメラ博物館")
	require.NoError(t, err)
	require.NoError(t, os.WriteFile("test.png", image, 0666))
}

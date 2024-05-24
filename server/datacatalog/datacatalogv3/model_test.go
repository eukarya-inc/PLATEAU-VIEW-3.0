package datacatalogv3

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAllData_FindPlateauFeatureItemByCityID(t *testing.T) {
	// Create a sample AllData instance
	data := &AllData{
		FeatureTypes: FeatureTypes{
			Plateau: []FeatureType{
				{Code: "code1"},
				{Code: "code2"},
			},
		},
		Plateau: map[string][]*PlateauFeatureItem{
			"code1": {
				{City: "city1"},
				{City: "city2"},
			},
			"code2": {
				{City: "city3"},
				{City: "city4"},
			},
		},
	}

	// Test case 1: City ID exists in the Plateau feature items
	ft := "code1"
	cityID := "city2"
	expected := &PlateauFeatureItem{City: "city2"}
	result := data.FindPlateauFeatureItemByCityID(ft, cityID)
	assert.Equal(t, expected, result)

	// Test case 2: City ID does not exist in the Plateau feature items
	ft = "code2"
	cityID = "city5"
	expected = nil
	result = data.FindPlateauFeatureItemByCityID(ft, cityID)
	assert.Equal(t, expected, result)
}

func TestAllData_FindPlateauFeatureItemsByCityID(t *testing.T) {
	// Create a sample AllData instance
	data := &AllData{
		FeatureTypes: FeatureTypes{
			Plateau: []FeatureType{
				{Code: "code1"},
				{Code: "code2"},
			},
		},
		Plateau: map[string][]*PlateauFeatureItem{
			"code1": {
				{City: "city1"},
				{City: "city2"},
			},
			"code2": {
				{City: "city3"},
				{City: "city4"},
			},
		},
	}

	// Test case 1: City ID exists in the Plateau feature items
	cityID := "city2"
	expected := &PlateauFeatureItem{City: "city2"}
	result := data.FindPlateauFeatureItemsByCityID(cityID)
	assert.Equal(t, expected, result)

	// Test case 2: City ID does not exist in the Plateau feature items
	cityID = "city5"
	expected = nil
	result = data.FindPlateauFeatureItemsByCityID(cityID)
	assert.Equal(t, expected, result)
}

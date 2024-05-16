package preparegspatialjp

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

// cd worker/preparegspatialjp; go test . -run TestCommand -timeout 10h -v
func TestCommand(t *testing.T) {
	skip := true
	_ = godotenv.Load("../.env")

	conf := MultipleConfig{
		Config: Config{
			CMSURL:              os.Getenv("REEARTH_CMS_URL"),
			CMSToken:            os.Getenv("REEARTH_CMS_TOKEN"),
			ProjectID:           os.Getenv("REEARTH_CMS_PROJECT"),
			SkipCityGML:         true,
			SkipPlateau:         true,
			SkipMaxLOD:          true,
			SkipRelated:         true,
			SkipIndex:           true,
			WetRun:              false,
			Clean:               true,
			ValidateMaxLOD:      true,
			SkipImcompleteItems: true,
			IgnoreStatus:        true,
		},
		CityItemID: []string{},
		CityNames:  []string{},
	}

	if skip || conf.CMSURL == "" || conf.CMSToken == "" || conf.ProjectID == "" {
		t.Skip("skipped")
	}

	if err := CommandMultiple(&conf); err != nil {
		t.Fatal(err)
	}
}

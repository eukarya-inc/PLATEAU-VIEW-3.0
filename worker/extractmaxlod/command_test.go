package extractmaxlod

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestRun(t *testing.T) {
	skip := true
	_ = godotenv.Load("../.env")

	conf := Config{
		CMSURL:       os.Getenv("REEARTH_CMS_URL"),
		CMSToken:     os.Getenv("REEARTH_CMS_TOKEN"),
		ProjectID:    os.Getenv("REEARTH_CMS_PROJECT"),
		FeatureTypes: []string{"dem"},
		CityItemID:   []string{},
		CityNames:    []string{},
		WetRun:       false,
		Overwrite:    true,
		Clean:        true,
	}

	if skip || conf.CMSURL == "" || conf.CMSToken == "" || conf.ProjectID == "" {
		t.Skip("skip")
	}

	if err := Run(conf); err != nil {
		t.Fatal(err)
	}
}

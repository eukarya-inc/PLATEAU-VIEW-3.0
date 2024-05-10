package extractmaxlod

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestRun(t *testing.T) {
	_ = godotenv.Load("../.env")

	conf := Config{
		CMSURL:       os.Getenv("REEARTH_CMS_URL"),
		CMSToken:     os.Getenv("REEARTH_CMS_TOKEN"),
		ProjectID:    os.Getenv("REEARTH_CMS_PROJECT"),
		FeatureTypes: []string{"dem"},
		CityItemID:   []string{},
		Overwrite:    false,
		WetRun:       false,
		Clean:        false,
	}

	if conf.CMSURL == "" || conf.CMSToken == "" || conf.ProjectID == "" {
		t.Skip("CMS URL, CMS Token, ProjectID is empty")
	}

	if err := Run(conf); err != nil {
		t.Fatal(err)
	}
}

package preparegspatialjp

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestCommandSingle(t *testing.T) {
	_ = godotenv.Load("../.env")

	conf := Config{
		CMSURL:      os.Getenv("REEARTH_CMS_URL"),
		CMSToken:    os.Getenv("REEARTH_CMS_TOKEN"),
		ProjectID:   "",
		CityItemID:  "",
		SkipCityGML: true,
		SkipPlateau: true,
		SkipMaxLOD:  true,
		SkipRelated: true,
		SkipIndex:   false,
		WetRun:      false,
		Clean:       true,
	}

	if conf.ProjectID == "" || conf.CityItemID == "" {
		t.Skip("ProjectID or CityItemID is empty")
	}

	if err := CommandSingle(&conf); err != nil {
		t.Fatal(err)
	}
}

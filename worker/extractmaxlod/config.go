package extractmaxlod

import (
	"fmt"

	cms "github.com/reearth/reearth-cms-api/go"
)

type Config struct {
	CMSURL       string
	CMSToken     string
	ProjectID    string
	CityItemID   []string
	FeatureTypes []string
	Overwrite    bool
	WetRun       bool
	Clean        bool
}

func (conf Config) CMS() (*cms.CMS, error) {
	cms, err := cms.New(conf.CMSURL, conf.CMSToken)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize CMS client: %w", err)
	}
	return cms, nil
}

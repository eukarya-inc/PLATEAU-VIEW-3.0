package cmsintegration

import (
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/fme"
)

type Config struct {
	FMEMock             bool
	FMEBaseURL          string
	FMEToken            string
	FMEResultURL        string
	FMESkipQualityCheck bool
	CMSModelID          string
	CMSCityGMLFieldID   string
	CMSBldgFieldID      string
	CMSBaseURL          string
	CMSToken            string
	Secret              string
}

type Services struct {
	FME fme.Interface
	CMS cms.Interface
}

func NewServices(c Config) (s Services, _ error) {
	if !c.FMEMock {
		fme, err := fme.New(c.FMEBaseURL, c.FMEToken, c.FMEResultURL+"/notify", c.FMESkipQualityCheck)
		if err != nil {
			return Services{}, fmt.Errorf("failed to init fme: %w", err)
		}
		s.FME = fme
	}

	cms, err := cms.New(c.CMSBaseURL, c.CMSToken)
	if err != nil {
		return Services{}, fmt.Errorf("failed to init cms: %w", err)
	}
	s.CMS = cms

	return
}

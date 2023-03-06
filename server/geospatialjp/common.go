package geospatialjp

import (
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/geospatialjp/ckan"
)

type Config struct {
	CkanBase                  string
	CkanOrg                   string
	CkanToken                 string
	CkanPrivate               bool
	CMSBase                   string
	CMSToken                  string
	CMSIntegration            string
	DisablePublication        bool
	DisableCatalogCheck       bool
	EnablePulicationOnWebhook bool
}

type Services struct {
	CMS         *cms.CMS
	Ckan        *ckan.Ckan
	CkanOrg     string
	CkanPrivate bool
}

func NewServices(conf Config) (*Services, error) {
	cms, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return nil, fmt.Errorf("failed to init cms: %w", err)
	}

	ckan, err := ckan.New(conf.CkanBase, conf.CkanToken)
	if err != nil {
		return nil, fmt.Errorf("failed to init ckan: %w", err)
	}

	return &Services{
		CMS:         cms,
		Ckan:        ckan,
		CkanOrg:     conf.CkanOrg,
		CkanPrivate: conf.CkanPrivate,
	}, nil
}

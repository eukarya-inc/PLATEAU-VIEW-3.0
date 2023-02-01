package main

import (
	"fmt"
	"net/url"
	"os"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration"
	"github.com/eukarya-inc/reearth-plateauview/server/geospatialjp"
	"github.com/eukarya-inc/reearth-plateauview/server/opinion"
	"github.com/eukarya-inc/reearth-plateauview/server/sdk"
	"github.com/eukarya-inc/reearth-plateauview/server/sdkapi"
	"github.com/eukarya-inc/reearth-plateauview/server/searchindex"
	"github.com/eukarya-inc/reearth-plateauview/server/share"
	"github.com/eukarya-inc/reearth-plateauview/server/sidebar"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
)

const configPrefix = "REEARTH_PLATEAUVIEW"

type Config struct {
	CMS_ModelID      string
	CMS_ShareProject string
	CMS_ShareModel   string
	// CMS_ShareField            string
	CMS_IndexerStorageProject string
	CMS_IndexerStorageModel   string
	// CMS_SDKModel              string
	Port                 uint   `default:"8080" envconfig:"PORT"`
	Host                 string `default:"http://localhost:8080"`
	Origin               []string
	CMS_Webhook_Secret   string
	CMS_BaseURL          string
	CMS_Token            string
	CMS_IntegrationID    string
	CMS_SystemProject    string
	CMS_SDKProject       string
	FME_BaseURL          string
	FME_Mock             bool
	FME_Token            string
	FME_SkipQualityCheck bool
	Ckan_BaseURL         string
	Ckan_Org             string
	Ckan_Token           string
	Ckan_Private         bool
	SDK_Token            string
	SendGrid_APIKey      string
	Opinion_Email        string
	Opinion_ToName       string
	Secret               string
	Debug                bool
	Sidebar_Token        string
}

func NewConfig() (*Config, error) {
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		return nil, err
	} else if err == nil {
		log.Infof("config: .env loaded")
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	return &c, err
}

func (c *Config) Print() string {
	s := fmt.Sprintf("%+v", c)
	return s
}

func (c *Config) CMSIntegration() cmsintegration.Config {
	return cmsintegration.Config{
		FMEMock:             c.FME_Mock,
		FMEBaseURL:          c.FME_BaseURL,
		FMEToken:            c.FME_Token,
		FMEResultURL:        util.DR(url.JoinPath(c.Host, "notify_fme")),
		FMESkipQualityCheck: c.FME_SkipQualityCheck,
		CMSBaseURL:          c.CMS_BaseURL,
		CMSToken:            c.CMS_Token,
		CMSIntegration:      c.CMS_IntegrationID,
		Secret:              c.Secret,
		Debug:               c.Debug,
	}
}

func (c *Config) SearchIndex() searchindex.Config {
	return searchindex.Config{
		CMSBase:           c.CMS_BaseURL,
		CMSToken:          c.CMS_Token,
		CMSStorageProject: c.CMS_SystemProject,
		// CMSStorageModel:   c.CMS_IndexerStorageModel,
	}
}

func (c *Config) SDK() sdk.Config {
	return sdk.Config{
		FMEBaseURL:     c.FME_BaseURL,
		FMEToken:       c.FME_Token,
		FMEResultURL:   util.DR(url.JoinPath(c.Host, "notify_sdk")),
		CMSBase:        c.CMS_BaseURL,
		CMSToken:       c.CMS_Token,
		CMSIntegration: c.CMS_IntegrationID,
		Secret:         c.Secret,
	}
}

func (c *Config) SDKAPI() sdkapi.Config {
	return sdkapi.Config{
		CMSBaseURL: c.CMS_BaseURL,
		Project:    c.CMS_SDKProject,
		// Model:      c.CMS_SDKModel,
		Token: c.SDK_Token,
	}
}

func (c *Config) Share() share.Config {
	return share.Config{
		CMSBase:    c.CMS_BaseURL,
		CMSToken:   c.CMS_Token,
		CMSProject: c.CMS_SystemProject,
		// CMSModel:   c.CMS_ShareModel,
		// CMSDataFieldKey: c.CMS_ShareField,
	}
}

func (c *Config) Opinion() opinion.Config {
	return opinion.Config{
		SendGridAPIKey: c.SendGrid_APIKey,
		Email:          c.Opinion_Email,
		ToName:         c.Opinion_ToName,
	}
}

func (c *Config) Geospatialjp() geospatialjp.Config {
	return geospatialjp.Config{
		CkanBase:       c.Ckan_BaseURL,
		CkanOrg:        c.Ckan_Org,
		CkanToken:      c.Ckan_Token,
		CkanPrivate:    c.Ckan_Private,
		CMSToken:       c.CMS_Token,
		CMSBase:        c.CMS_BaseURL,
		CMSIntegration: c.CMS_IntegrationID,
	}
}

func (c *Config) Sidebar() sidebar.Config {
	return sidebar.Config{
		CMSBaseURL: c.CMS_BaseURL,
		CMSToken:   c.CMS_Token,
		CMSProject: c.CMS_SystemProject,
		AdminToken: c.Sidebar_Token,
	}
}

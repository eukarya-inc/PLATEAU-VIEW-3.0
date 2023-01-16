package main

import (
	"fmt"
	"net/url"
	"os"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration"
	"github.com/eukarya-inc/reearth-plateauview/server/geospatialjp"
	"github.com/eukarya-inc/reearth-plateauview/server/opinion"
	"github.com/eukarya-inc/reearth-plateauview/server/sdk"
	"github.com/eukarya-inc/reearth-plateauview/server/share"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
)

const configPrefix = "REEARTH_PLATEAUVIEW"

type Config struct {
	Port                 uint   `default:"8080" envconfig:"PORT"`
	Host                 string `default:"http://localhost:8080"`
	Origin               []string
	CMS_Webhook_Secret   string
	CMS_BaseURL          string
	CMS_Token            string
	CMS_ShareModelID     string
	CMS_ShareDataFieldID string
	FME_BaseURL          string
	FME_Mock             bool
	FME_Token            string
	FME_SkipQualityCheck bool
	Ckan_BaseURL         string
	Ckan_Org             string
	Ckan_Token           string
	Ckan_Private         bool
	SendGrid_APIKey      string
	Opinion_Email        string
	Opinion_ToName       string
	Secret               string
	Debug                bool
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
		Secret:              c.Secret,
		Debug:               c.Debug,
	}
}

func (c *Config) SDK() sdk.Config {
	return sdk.Config{
		FMEBaseURL:   c.FME_BaseURL,
		FMEToken:     c.FME_Token,
		FMEResultURL: util.DR(url.JoinPath(c.Host, "notify_sdk")),
		CMSBase:      c.CMS_BaseURL,
		CMSToken:     c.CMS_Token,
		Secret:       c.Secret,
	}
}

func (c *Config) Share() share.Config {
	return share.Config{
		CMSBase:        c.CMS_BaseURL,
		CMSToken:       c.CMS_Token,
		CMSModelID:     c.CMS_ShareModelID,
		CMSDataFieldID: c.CMS_ShareDataFieldID,
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
		CkanBase:    c.Ckan_BaseURL,
		CkanOrg:     c.Ckan_Org,
		CkanToken:   c.Ckan_Token,
		CkanPrivate: c.Ckan_Private,
		CMSToken:    c.CMS_Token,
		CMSBase:     c.CMS_BaseURL,
	}
}

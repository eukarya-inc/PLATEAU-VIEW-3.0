package main

import (
	"fmt"
	"os"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearthx/log"
)

const configPrefix = "REEARTH_PLATEAUVIEW_"

type Config struct {
	Port               uint   `default:"8080" envconfig:"PORT"`
	Host               string `default:"http://localhost:8080"`
	CMS_Webhook_Secret string
	CMS_ModelID        string
	CMS_CityGMLFieldID string
	CMS_BldgFieldID    string
	CMS_BaseURL        string
	CMS_Token          string
	FME_BaseURL        string
	FME_Mock           bool
	FME_Token          string
	Secret             string
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
		FMEMock:           c.FME_Mock,
		FMEBaseURL:        c.FME_BaseURL,
		FMEToken:          c.FME_Token,
		FMEResultURL:      c.Host,
		CMSModelID:        c.CMS_ModelID,
		CMSCityGMLFieldID: c.CMS_CityGMLFieldID,
		CMSBldgFieldID:    c.CMS_BldgFieldID,
		CMSBaseURL:        c.CMS_BaseURL,
		CMSToken:          c.CMS_Token,
		CMSWebhookSecret:  c.CMS_Webhook_Secret,
		Secret:            c.Secret,
	}
}

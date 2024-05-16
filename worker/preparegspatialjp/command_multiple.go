package preparegspatialjp

import (
	"context"
	"strings"

	"github.com/reearth/reearthx/log"
)

type MultipleConfig struct {
	CityItemID []string
	CityNames  []string
	Offset     int
	Config
}

func CommandMultiple(conf *MultipleConfig) error {
	if len(conf.CityItemID) == 0 {
		ctx := context.Background()
		ids, err := FetchAllCities(ctx, conf)
		if err != nil {
			return err
		}

		if conf.Offset > 0 {
			ids = ids[conf.Offset:]
		}

		conf.CityItemID = ids
	}

	le := len(conf.CityItemID)
	failed := []string{}

	for i, cityItemID := range conf.CityItemID {
		log.Infof("START: cityItem=%s (%d/%d)", cityItemID, i+1, le)

		conf.Config.CityItemID = cityItemID
		if err := CommandSingle(&conf.Config); err != nil {
			failed = append(failed, cityItemID)
			log.Errorf("FAILED: %s (%d/%d): %v", cityItemID, i+1, le, err)
			continue
		}
	}

	if len(failed) > 0 {
		log.Errorf("FAILED: %v", failed)
	}

	return nil
}

func (c *Config) ToMultiple() *MultipleConfig {
	if c == nil {
		return nil
	}

	cities := strings.Split(c.CityItemID, ",")
	if len(cities) == 0 {
		return nil
	}

	return &MultipleConfig{
		CityItemID: cities,
		Config:     *c,
	}
}

func Command(c *Config) error {
	if mc := c.ToMultiple(); mc != nil {
		return CommandMultiple(mc)
	}

	return nil
}

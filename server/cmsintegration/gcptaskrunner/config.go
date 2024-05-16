package gcptaskrunner

import (
	"time"

	"dario.cat/mergo"
	"github.com/hako/durafmt"
)

type Config struct {
	Service Service
	Task    Task
	Env     map[string]string
	Project string
	Region  string
	// Cloud Build
	MachineType string
	Tags        []string
	DiskSizeGb  int64
	Timeout     string
	QueueTtl    string
}

func MergeConfigs(conf ...Config) Config {
	c := Config{}
	for _, conf := range conf {
		_ = mergo.Merge(&c, conf, mergo.WithOverride)
	}
	return c
}

func parseDuration(s string) time.Duration {
	d, err := durafmt.ParseString(s)
	if err != nil {
		return 0
	}

	return d.Duration()
}

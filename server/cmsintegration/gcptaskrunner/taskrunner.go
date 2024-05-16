package gcptaskrunner

import (
	"context"
	"errors"
)

var (
	ErrJobNameEmpty = errors.New("job name is empty")
	ErrImageEmpty   = errors.New("image is empty")
)

type Service string

const (
	ServiceCloudBatch   Service = "cloudbatch"
	ServiceCloudBuild   Service = "cloudbuild"
	ServiceCloudRunJobs Service = "cloudrunjobs"
)

type TaskRunner interface {
	Run(context.Context, Task, *Config) error
}

type GCPTaskRunner struct {
	conf Config
}

var _ TaskRunner = &GCPTaskRunner{}

func NewGCPTaskRunner(conf Config) *GCPTaskRunner {
	return &GCPTaskRunner{
		conf: conf,
	}
}

func (r *GCPTaskRunner) Run(ctx context.Context, task Task, conf *Config) error {
	var c Config
	if conf == nil {
		c = r.conf
	} else {
		c = MergeConfigs(r.conf, *conf)
	}

	t := mergeTasks(c.Task, task)

	switch c.Service {
	case ServiceCloudBuild:
		return RunCloudBuild(ctx, t, c)
	case ServiceCloudBatch:
		return RunCloudBatch(ctx, t, c)
	case ServiceCloudRunJobs:
		return RunCloudRunJobs(ctx, t, c)
	}

	return nil
}

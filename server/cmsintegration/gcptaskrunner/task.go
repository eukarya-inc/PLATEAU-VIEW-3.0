package gcptaskrunner

import "dario.cat/mergo"

type Task struct {
	// common
	Args []string
	Env  map[string]string
	// Cloud Build and Cloud Batch
	Image string
	// Cloud Run Jobs
	JobName string
}

func envToSlices(env map[string]string) []string {
	if env == nil {
		return nil
	}

	var envs []string
	for k, v := range env {
		envs = append(envs, k+"="+v)
	}
	return envs
}

func mergeEnv(env ...map[string]string) map[string]string {
	res := make(map[string]string)
	for _, e := range env {
		if e == nil {
			continue
		}
		for k, v := range e {
			res[k] = v
		}
	}
	return res
}

func mergeTasks(a, b Task) Task {
	res := a
	_ = mergo.Merge(&res, b, mergo.WithOverride)
	return res
}

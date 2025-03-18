package gcptaskrunner

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMergeConfig(t *testing.T) {
	assert.Equal(t, Config{
		Env: map[string]string{
			"key": "val",
		},
		Task: Task{
			Image: "img",
			Args:  []string{"b"},
			Env: map[string]string{
				"key":  "val",
				"key2": "val",
			},
		},
	}, MergeConfigs(Config{
		Task: Task{
			Image: "img",
			Args:  []string{"a"},
			Env: map[string]string{
				"key": "val",
			},
		},
	}, Config{
		Env: map[string]string{
			"key": "val",
		},
		Task: Task{
			Args: []string{"b"},
			Env: map[string]string{
				"key2": "val",
			},
		},
	}))
}

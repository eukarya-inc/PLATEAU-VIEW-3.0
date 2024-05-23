package gcptaskrunner

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMergeTasks(t *testing.T) {
	assert.Equal(t, Task{
		Image: "img",
		Args:  []string{"b"},
		Env: map[string]string{
			"key":  "val",
			"key2": "val",
		},
	}, mergeTasks(Task{
		Image: "img",
		Args:  []string{"a"},
		Env: map[string]string{
			"key": "val",
		},
	}, Task{
		Args: []string{"b"},
		Env: map[string]string{
			"key2": "val",
		},
	}))
}

package searchindex

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPathFileName(t *testing.T) {
	assert.Equal(t, "bbb", pathFileName("aaaa/bbb.txt"))
}

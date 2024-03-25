package cmsintegrationv3

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetBracketContent(t *testing.T) {
	assert.Equal(t, "", getBracketContent("トンネルモデル"))
	assert.Equal(t, "tun", getBracketContent("トンネルモデル（tun）"))
}

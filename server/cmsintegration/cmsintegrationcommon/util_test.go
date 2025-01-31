package cmsintegrationcommon

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetBracketContent(t *testing.T) {
	assert.Equal(t, "", GetLastBracketContent("トンネルモデル"))
	assert.Equal(t, "tran", GetLastBracketContent("交通（道路）モデル（tran）"))
}

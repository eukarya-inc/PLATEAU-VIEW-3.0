package cmsintegrationv3

import (
	"fmt"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
)

func tagIs(t *cms.Tag, v fmt.Stringer) bool {
	return t != nil && t.Name == v.String()
}

func tagIsNot(t *cms.Tag, v fmt.Stringer) bool {
	return t != nil && t.Name != v.String()
}

func tagFrom(t fmt.Stringer) *cms.Tag {
	s := t.String()
	if s == "" {
		return nil
	}
	return &cms.Tag{
		Name: s,
	}
}

func getBracketContent(s string) string {
	if strings.Contains(s, "（") && strings.Contains(s, "）") {
		return strings.Split(strings.Split(s, "（")[1], "）")[0]
	}

	return ""
}

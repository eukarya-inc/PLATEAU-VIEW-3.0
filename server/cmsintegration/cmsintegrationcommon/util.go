package cmsintegrationcommon

import (
	"fmt"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
)

func TagIs(t *cms.Tag, v fmt.Stringer) bool {
	return t != nil && t.Name == v.String()
}

func TagIsNot(t *cms.Tag, v fmt.Stringer) bool {
	return t != nil && t.Name != v.String()
}

func TagFrom(t fmt.Stringer) *cms.Tag {
	s := t.String()
	if s == "" {
		return nil
	}
	return &cms.Tag{
		Name: s,
	}
}

func GetLastBracketContent(s string) string {
	if strings.Contains(s, "（") && strings.Contains(s, "）") {
		_, s := CutStringRight(s, "（")
		s, _, _ = strings.Cut(s, "）")
		return s
	}

	return ""
}

func CutStringRight(s string, sep string) (string, string) {
	if i := strings.LastIndex(s, sep); i >= 0 {
		return s[:i], s[i+len(sep):]
	}
	return s, ""
}

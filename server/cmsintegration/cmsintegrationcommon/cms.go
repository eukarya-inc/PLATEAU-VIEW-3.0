package cmsintegrationcommon

import (
	"strings"

	"github.com/oklog/ulid/v2"
)

func GenerateCMSID() string {
	return strings.ToLower(ulid.Make().String())
}

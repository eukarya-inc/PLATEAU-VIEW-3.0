package citygmlpacker

import (
	"time"
)

type Config struct {
	Dest    string
	Domain  string
	GMLURLs []string
	ZipURLs []string
	Timeout time.Duration
}

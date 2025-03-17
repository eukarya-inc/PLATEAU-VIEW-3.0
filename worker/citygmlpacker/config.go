package citygmlpacker

import (
	"time"
)

type Config struct {
	Dest    string
	Domain  string
	URLs    []string
	Timeout time.Duration
}

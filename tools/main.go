package main

import (
	"fmt"
	"os"

	"github.com/jpillora/opts"
)

type Config struct {
	Command string   `opts:"mode=cmdname"`
	Convert *Convert `opts:"mode=cmd" help:"国土数値情報を基に作成されたランドマーク・鉄道駅・行政界のGeoJSONのCZMLへの変換を行います。"`
}

func main() {
	c := Config{}
	opts.Parse(&c)

	var err error
	switch c.Command {
	case "convert":
		err = c.Convert.Execute()
	}

	if err != nil {
		os.Stderr.WriteString(fmt.Sprintf("%s\n", err))
		os.Exit(1)
	}
}

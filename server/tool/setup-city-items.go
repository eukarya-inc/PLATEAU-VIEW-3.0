package tool

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"net/http"
	"os"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintsetup"
	"github.com/k0kubun/pp/v3"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
)

func setupCityItems(conf *Config, args []string) error {
	println("setup-city-items")

	var base, token, file string
	inp := cmsintsetup.SetupCityItemsInput{}

	flags := flag.NewFlagSet("setup-city-items", flag.ExitOnError)
	flags.StringVar(&base, "base", conf.CMS_BaseURL, "CMS base URL")
	flags.StringVar(&token, "token", conf.CMS_Token, "CMS token")
	flags.StringVar(&inp.ProjectID, "project", "", "project ID")
	flags.StringVar(&file, "file", "", "file path")
	flags.BoolVar(&inp.Force, "force", false, "force")
	flags.IntVar(&inp.Offset, "offset", 0, "offset")
	flags.IntVar(&inp.Limit, "limit", 0, "limit")
	flags.BoolVar(&inp.DryRun, "dryrun", false, "dryrun")
	if err := flags.Parse(args); err != nil {
		return err
	}

	if base == "" || token == "" || inp.ProjectID == "" || file == "" {
		if base == "" {
			fmt.Println("CMS base URL is required")
		}
		if token == "" {
			fmt.Println("CMS token is required")
		}
		if inp.ProjectID == "" {
			fmt.Println("project is required")
		}
		if file == "" {
			fmt.Println("file is required")
		}
		return errors.New("CMS base URL, CMS token, project, and file are required")
	}

	pp.Printf("args: %v\n", inp)

	f, err := os.Open(file)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}

	defer f.Close()

	inp.DataBody = f
	err = cmsintsetup.SetupCityItems(
		context.Background(),
		&cmsintsetup.Services{
			CMS:  lo.Must(cms.New(base, token)),
			HTTP: http.DefaultClient,
		},
		inp,
		func(i, l int, item cmsintsetup.SetupCSVItem) {
			fmt.Printf("processing %d/%d %s\n", i, l, item.Name)
		},
	)

	if err != nil {
		return fmt.Errorf("failed to setup city items: %w", err)
	}

	return nil
}

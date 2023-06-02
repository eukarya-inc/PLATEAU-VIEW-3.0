package sdkapi

import (
	"context"
	"testing"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
)

func TestCMS(t *testing.T) {
	cmsbase := ""
	cmstoken := ""
	cmsproject := ""

	if cmsbase == "" || cmstoken == "" || cmsproject == "" {
		t.SkipNow()
	}

	ctx := context.Background()
	cms := lo.Must(cms.New(cmsbase, cmstoken))
	c := &CMS{
		Project:              cmsproject,
		IntegrationAPIClient: cms,
	}
	_ = lo.Must(c.Datasets(ctx, modelKey))
	// res := lo.Must(cms.GetItemsByKey(ctx, "", modelKey, true))
	// t.Log(string(lo.Must(json.MarshalIndent(res, "", "  "))))
}

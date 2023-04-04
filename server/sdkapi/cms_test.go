package sdkapi

/*
import (
	"context"
	"encoding/json"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/samber/lo"
)

func TestCMS(t *testing.T) {
	ctx := context.Background()
	cms := lo.Must(cms.New("", ""))
	c := &CMS{
		Project:              "",
		IntegrationAPIClient: cms,
	}
	res := lo.Must(c.Datasets(ctx, modelKey))
	t.Log(string(lo.Must(json.MarshalIndent(res, "", "  "))))
}
// */

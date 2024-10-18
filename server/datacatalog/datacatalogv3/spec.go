package datacatalogv3

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
)

func getPlateauSpecs(ctx context.Context, maxYear int) ([]plateauapi.PlateauSpecSimple, error) {
	cms := plateaucms.GetPlateauCMSFromContext(ctx)
	if cms == nil {
		return nil, fmt.Errorf("failed to get cms from context")
	}

	res, err := cms.PlateauSpecs(ctx)
	if err != nil {
		return nil, err
	}

	res2 := make([]plateauapi.PlateauSpecSimple, 0, len(res))
	for _, r := range res {
		if r.Year > maxYear {
			continue
		}
		res2 = append(res2, toSimpleSpec(r))
	}

	return res2, nil
}

func toSimpleSpec(s plateaucms.PlateauSpec) plateauapi.PlateauSpecSimple {
	return plateauapi.PlateauSpecSimple{
		MajorVersion:  s.MajorVersion,
		Year:          s.Year,
		MinorVersions: s.MinorVersions(),
	}
}

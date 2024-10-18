package datacatalogv3

import (
	"context"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
)

func getPlateauSpecs(ctx context.Context, pcms plateaucms.SpecStore, maxYear int) ([]plateauapi.PlateauSpecSimple, error) {
	res, err := pcms.PlateauSpecs(ctx)
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

package preparegspatialjp

import (
	"context"
	"encoding/csv"
	"fmt"

	"github.com/reearth/reearthx/log"
)

func ValidateMaxLOD(ctx context.Context, cw *CMSWrapper, mc MergeContext) (err error) {
	if mc.GspatialjpDataItem.MaxLODURL == "" {
		log.Infofc(ctx, "maxlod validation (%s/%s): skipped", mc.CityItem.ID, mc.CityItem.CityName)
		return nil
	}

	// download maxlod csv
	c, err := downloadFile(ctx, mc.GspatialjpDataItem.MaxLODURL)
	if err != nil {
		return fmt.Errorf("failed to download maxlod csv (%s/%s): %w", mc.CityItem.ID, mc.CityItem.CityName, err)
	}

	defer func() {
		_ = c.Close()
	}()

	// validate csv
	if _, err := csv.NewReader(c).ReadAll(); err != nil {
		return fmt.Errorf("maxlod validation failed (%s/%s): %w", mc.CityItem.ID, mc.CityItem.CityName, err)
	}

	log.Infofc(ctx, "maxlod validation (%s/%s): ok", mc.CityItem.ID, mc.CityItem.CityName)
	return nil
}

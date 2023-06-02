package sdk

import (
	"context"
	"encoding/csv"
	"errors"
	"io"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/fme"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
)

var ErrInvalidID = errors.New("invalid id")

type Config struct {
	CMSBase        string
	CMSToken       string
	CMSIntegration string
	FMEBaseURL     string
	FMEToken       string
	FMEResultURL   string
	FMESecret      string
	APIToken       string
}

type Services struct {
	CMS       cms.Interface
	FME       fme.Interface
	FMESecret string
}

func NewServices(conf Config) (*Services, error) {
	cms, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return nil, err
	}

	fme, err := fme.New(conf.FMEBaseURL, conf.FMEToken, conf.FMEResultURL)
	if err != nil {
		return nil, err
	}

	return &Services{CMS: cms, FME: fme, FMESecret: conf.FMESecret}, nil
}

func (s *Services) RequestMaxLODExtraction(ctx context.Context, item Item, project string, force bool) {
	if !force && item.MaxLODStatus != "" && item.MaxLODStatus != StatusReady {
		log.Debugf("sdk: skipped: %s", item.MaxLODStatus)
		return
	}

	if item.CityGML == "" {
		log.Debugf("sdk: skipped: no citygml")
		return
	}

	log.Infof("sdk: item: %+v", item)

	citygml, err := s.CMS.Asset(ctx, item.CityGML)
	if err != nil {
		log.Errorf("sdk: failed to get citygml asset: %s", err)
		return
	}

	if err := s.FME.Request(ctx, fme.MaxLODRequest{
		ID: fme.ID{
			ItemID:    item.ID,
			AssetID:   citygml.ID,
			ProjectID: project,
		}.String(s.FMESecret),
		Target: citygml.URL,
	}); err != nil {
		log.Errorf("sdk: failed to send request to FME: %s", err)
		return
	}

	if _, err := s.CMS.UpdateItem(ctx, item.ID, Item{
		MaxLODStatus: StatusProcessing,
	}.Fields()); err != nil {
		log.Errorf("sdk: failed to update item: %v", err)
	}
}

func (s *Services) ReceiveFMEResult(ctx context.Context, f FMEResult) error {
	id, err := fme.ParseID(f.ID, s.FMESecret)
	if err != nil {
		return ErrInvalidID
	}

	log.Infof("sdk notify: validate: itemID=%s, assetID=%s", id.ItemID, id.AssetID)

	hasDem, err := IsDemIncludedInCSV(f.ResultURL)
	if err != nil {
		log.Errorf("sdk notify: failed to read result csv: %v", err)
		return nil
	}

	aid, err := s.CMS.UploadAsset(ctx, id.ProjectID, f.ResultURL)
	if err != nil {
		log.Errorf("sdk notify: failed to upload assets: %v", err)

		if _, err := s.CMS.UpdateItem(ctx, id.ItemID, Item{
			MaxLODStatus: StatusError,
		}.Fields()); err != nil {
			log.Errorf("sdk notify: failed to update item: %v", err)
		}
		return nil
	}

	dem := "無し"
	if hasDem {
		dem = "有り"
	}

	if _, err := s.CMS.UpdateItem(ctx, id.ItemID, Item{
		MaxLODStatus: StatusOK,
		MaxLOD:       aid,
		Dem:          dem,
	}.Fields()); err != nil {
		log.Errorf("sdk notify: failed to update item: %v", err)
		return nil
	}

	return nil
}

func IsDemIncludedInCSV(url string) (bool, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return false, err
	}

	defer func() {
		_ = res.Body.Close()
	}()

	c := csv.NewReader(res.Body)
	c.ReuseRecord = true

	// skip first line
	if _, err := c.Read(); err != nil {
		return false, err
	}

	for {
		f, err := c.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			return false, err
		}
		if len(f) > 1 && f[1] == "dem" {
			return true, nil
		}
	}
	return false, nil
}

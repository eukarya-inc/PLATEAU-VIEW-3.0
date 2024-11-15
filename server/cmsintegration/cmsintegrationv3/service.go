package cmsintegrationv3

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/gcptaskrunner"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
)

type Config = cmsintegrationcommon.Config

const fmeHandlerPath = "/notify_fme/v3"

func resultURL(conf *Config) string {
	return fmt.Sprintf("%s%s", conf.Host, fmeHandlerPath)
}

type Services struct {
	CMS          cms.Interface
	PlateauCMS   *PlateauCMS
	HTTP         *http.Client
	TaskRunner   gcptaskrunner.TaskRunner
	PCMS         plateaucms.SpecStore
	FMEResultURL string
	mockFME      fmeInterface
}

func NewServices(c Config) (s *Services, _ error) {
	s = &Services{}

	if !c.FMEMock {
		resultURL, err := url.JoinPath(c.Host, "/notify_fme")
		if err != nil {
			return nil, fmt.Errorf("failed to init fme: %w", err)
		}

		s.FMEResultURL = resultURL
	} else {
		s.mockFME = &fmeMock{}
	}

	cms, err := cms.New(c.CMSBaseURL, c.CMSToken)
	if err != nil {
		return nil, fmt.Errorf("failed to init cms: %w", err)
	}
	s.CMS = cms
	s.PlateauCMS = NewPlateauCMS(cms, "")

	pcms, err := plateaucms.New(plateaucms.Config{
		CMSBaseURL:      c.CMSBaseURL,
		CMSMainToken:    c.CMSToken,
		CMSTokenProject: c.CMSSystemProject,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to init plateau cms: %w", err)
	}
	s.PCMS = pcms

	if c.GCPProject != "" {
		image := c.TaskImage
		if image == "" {
			image = defaultTaskImage
		}

		s.TaskRunner = gcptaskrunner.NewGCPTaskRunner(gcptaskrunner.Config{
			Service: gcptaskrunner.ServiceCloudBuild,
			Project: c.GCPProject,
			Region:  c.GCPRegion,
			Task: gcptaskrunner.Task{
				Image: image,
			},
			Env: map[string]string{
				"REEARTH_CMS_URL":   c.CMSBaseURL,
				"REEARTH_CMS_TOKEN": c.CMSToken,
				"NO_COLOR":          "true",
			},
			Timeout:  "86400s", // 1 day
			QueueTtl: "86400s", // 1 day
		})
	}

	return
}

func (s *Services) GetFME(url string) fmeInterface {
	if s.mockFME != nil {
		return s.mockFME
	}
	return newFME(url, s.FMEResultURL)
}

func (s *Services) UpdateFeatureItemStatus(ctx context.Context, itemID string, convType fmeRequestType, status ConvertionStatus) error {
	var qcStatus, convStatus ConvertionStatus
	switch convType {
	case fmeTypeConv:
		convStatus = status
	case fmeTypeQC:
		qcStatus = status
	case fmeTypeQcConv:
		qcStatus = status
		convStatus = status
	}

	fields := (&FeatureItem{
		ConvertionStatus: tagFrom(convStatus),
		QCStatus:         tagFrom(qcStatus),
	}).CMSItem().MetadataFields
	_, err := s.CMS.UpdateItem(ctx, itemID, nil, fields)
	if err != nil {
		j, _ := json.Marshal(fields)
		log.Debugfc(ctx, "cmsintegrationv3: item update for %s: %s", itemID, j)
	}
	return err
}

func (s *Services) UploadAsset(ctx context.Context, pid, url string) (_ string, err error) {
	const max = 3
	var errs []error
	for i := 0; i < max; i++ {
		asset, err2 := s.CMS.UploadAsset(ctx, pid, url)
		if err2 == nil {
			return asset, nil
		}
		log.Debugfc(ctx, "cmsintegrationv3: failed to upload asset (retry %d/%d): %v", i, max-1, err2)
		errs = append(errs, err2)
	}
	return "", fmt.Errorf("failed to upload asset (retried %d): %w", max-1, errors.Join(errs...))
}

func (s *Services) DownloadAsset(ctx context.Context, assetID string) (io.ReadCloser, error) {
	asset, err := s.CMS.Asset(ctx, assetID)
	if err != nil {
		return nil, fmt.Errorf("failed to get asset: %w", err)
	}

	return s.GET(ctx, asset.URL)
}

func (s *Services) DownloadAssetAsBytes(ctx context.Context, assetID string) ([]byte, error) {
	body, err := s.DownloadAsset(ctx, assetID)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = body.Close()
	}()

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, fmt.Errorf("failed to read asset: %w", err)
	}

	return buf.Bytes(), nil
}

func (s *Services) GetMainItemWithMetadata(ctx context.Context, i *cms.Item) (_ *cms.Item, err error) {
	var mainItem, metadataItem *cms.Item

	if i.MetadataItemID == nil && i.OriginalItemID != nil {
		// w is metadata item
		metadataItem = i
		mainItem, err = s.CMS.GetItem(ctx, *i.OriginalItemID, false)
		if err != nil {
			return nil, fmt.Errorf("failed to get main item: %w", err)
		}
	} else if i.OriginalItemID == nil && i.MetadataItemID != nil {
		// w is main item
		mainItem = i
		metadataItem, err = s.CMS.GetItem(ctx, *i.MetadataItemID, false)
		if err != nil {
			return nil, fmt.Errorf("failed to get metadata item: %w", err)
		}
	} else {
		return nil, fmt.Errorf("invalid webhook payload")
	}

	mainItem.MetadataFields = metadataItem.Fields
	return mainItem, nil
}

func (s *Services) GET(ctx context.Context, url string) (io.ReadCloser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	client := s.HTTP
	if client == nil {
		client = http.DefaultClient
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to download asset: %w", err)
	}

	if res.StatusCode != http.StatusOK {
		_ = res.Body.Close()
		return nil, fmt.Errorf("failed to download asset: %s", res.Status)
	}

	return res.Body, nil
}

func (s *Services) GETAsBytes(ctx context.Context, url string) ([]byte, error) {
	body, err := s.GET(ctx, url)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = body.Close()
	}()

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, fmt.Errorf("failed to read asset: %w", err)
	}

	return buf.Bytes(), nil
}

func (s *Services) GetFMEURL(ctx context.Context, majorVersion int) string {
	specs, err := s.PCMS.PlateauSpecs(ctx)
	if err != nil {
		log.Errorfc(ctx, "cmsintegrationv3: failed to get plateau specs: %v", err)
		return ""
	}

	for _, spec := range specs {
		if spec.FMEURL == "" {
			continue
		}

		if spec.MajorVersion == majorVersion {
			return spec.FMEURL
		}
	}

	return ""
}

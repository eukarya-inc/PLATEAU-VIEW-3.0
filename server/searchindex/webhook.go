package searchindex

import (
	"bytes"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

var (
	modelKey = "plateau"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	c, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		if w.Type != "item.create" && w.Type != "item.update" {
			log.Debugf("searchindex webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.Data.Item == nil || w.Data.Model == nil {
			log.Debugf("searchindex webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.Data.Model.Key != modelKey {
			log.Debugf("searchindex webhook: invalid model id: %s, key: %s", w.Data.Item.ModelID, w.Data.Model.Key)
			return nil
		}

		item := ItemFrom(*w.Data.Item)
		log.Infof("searchindex webhook: item: %+v", item)

		if item.SeatchIndexStatus != "" && item.SeatchIndexStatus != StatusReady {
			log.Infof("searchindex webhook: skipped: %s", item.SeatchIndexStatus)
			return nil
		}

		if len(item.Bldg) == 0 {
			log.Infof("searchindex webhook: skipped: no bldg assets")
			return nil
		}

		ctx := req.Context()

		// get all assets
		var assets []*cms.Asset
		for _, aid := range item.Bldg {
			a, err := c.Asset(ctx, aid)
			if err != nil {
				log.Errorf("searchindex webhook: failed to get an asset (%s): %s", aid, err)

				if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
					SeatchIndexStatus: StatusError,
				}.Fields()); err != nil {
					log.Errorf("searchindex webhook: failed to update item: %s", err)
				}

				return nil
			}

			assets = append(assets, a)
		}

		// extract assets
		target := extractAssets(assets)

		// build index
		var indexAssetIDs []string
		var indexerr error
		for _, t := range target {
			indexer := NewIndexer(getAssetBase(t))
			result, err := indexer.BuildIndex()
			if err != nil {
				if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
					SeatchIndexStatus: StatusError,
				}.Fields()); err != nil {
					log.Errorf("searchindex webhook: failed to update item: %s", err)
				}
				return nil
			}

			// upload indexes
			for _, r := range result {
				if a, err := c.UploadAssetDirectly(ctx, w.Data.Schema.ProjectID, r.Name, bytes.NewReader(r.Data)); err != nil {
					indexerr = err
					break
				} else {
					indexAssetIDs = append(indexAssetIDs, a)
				}
			}

			if indexerr != nil {
				break
			}
		}

		if indexerr != nil {
			log.Errorf("searchindex webhook: failed to build and upload indexes: %s", indexerr)
			if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
				SeatchIndexStatus: StatusError,
			}.Fields()); err != nil {
				log.Errorf("searchindex webhook: failed to update item: %s", err)
			}
			return nil
		}

		// update item
		if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
			SeatchIndexStatus: StatusOK,
			SearchIndex:       indexAssetIDs,
		}.Fields()); err != nil {
			log.Errorf("searchindex webhook: failed to update item: %s", err)
		}

		return nil
	}, nil
}

func extractAssets(assets []*cms.Asset) []*cms.Asset {
	return lo.Filter(assets, func(a *cms.Asset, _ int) bool {
		// TODO
		return true
	})
}

func getAssetBase(a *cms.Asset) string {
	u, _ := url.Parse(a.URL)
	b := path.Join(path.Dir(u.Path), strings.TrimSuffix(path.Base(u.Path), path.Ext(u.Path)))
	u.Path = b
	return u.String()
}

package searchindex

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"regexp"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/reearth/reearthx/log"
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
		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate {
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

		pid := w.Data.Schema.ProjectID
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

		if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
			SeatchIndexStatus: StatusProcessing,
		}.Fields()); err != nil {
			log.Errorf("searchindex webhook: failed to update item: %w", err)
		}

		log.Errorf("searchindex webhook: start processing")

		aid, err := do(ctx, c, item, pid)
		if err != nil {
			log.Errorf("searchindex webhook: %v", err)

			if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
				SeatchIndexStatus: StatusError,
			}.Fields()); err != nil {
				log.Errorf("searchindex webhook: failed to update item: %s", err)
			}

			if err := c.CommentToItem(ctx, w.Data.Item.ID, fmt.Sprintf("検索インデックスの構築に失敗しました。%v", err)); err != nil {
				log.Errorf("searchindex webhook: failed to comment: %s", err)
			}
			return nil
		}

		if _, err := c.UpdateItem(ctx, w.Data.Item.ID, Item{
			SeatchIndexStatus: StatusOK,
			SearchIndex:       aid,
		}.Fields()); err != nil {
			log.Errorf("searchindex webhook: failed to update item: %s", err)
		}

		if err := c.CommentToItem(ctx, w.Data.Item.ID, "検索インデックスの構築が完了しました。"); err != nil {
			log.Errorf("searchindex webhook: failed to comment: %s", err)
		}

		log.Infof("searchindex webhook: done")
		return nil
	}, nil
}

func do(ctx context.Context, c cms.Interface, item Item, pid string) (string, error) {
	// find asset
	var u *url.URL
	for _, aid := range item.Bldg {
		a, err := c.Asset(ctx, aid)
		if err != nil {
			return "", fmt.Errorf("failed to get an asset (%s): %s", aid, err)
		}

		u2, _ := url.Parse(a.URL)
		if strings.Contains(path.Base(u.Path), "_lod1") {
			u = u2
			break
		}
	}

	if u == nil {
		return "", errors.New("LOD1の3D Tilesの建築物モデルが登録されていません。")
	}

	name := pathFileName(u.Path)
	if name == "" {
		return "", fmt.Errorf("URLのパスが不正です。%s", u.Path)
	}

	// build index
	indexer := NewIndexer(c, getAssetBase(u), pid)
	return indexer.BuildIndex(ctx, cityCodeAndName(name))
}

func pathFileName(p string) string {
	return strings.TrimSuffix(path.Base(p), path.Ext(p))
}

func getAssetBase(u *url.URL) string {
	u2 := *u
	b := path.Join(path.Dir(u.Path), pathFileName(u.Path))
	u2.Path = b
	return u2.String()
}

var re = regexp.MustCompile("^([0-9]+?_.+?)_")

func cityCodeAndName(p string) string {
	m := re.FindStringSubmatch(p)
	if len(m) < 1 {
		return p
	}
	return m[1]
}

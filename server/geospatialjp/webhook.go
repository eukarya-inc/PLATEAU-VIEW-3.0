package geospatialjp

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"path"

	"github.com/eukarya-inc/reearth-plateauview/server/cms/cmswebhook"
	"github.com/eukarya-inc/reearth-plateauview/server/geospatialjp/ckan"
	"github.com/pkg/errors"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/xuri/excelize/v2"
)

var (
	modelKey  = "plateau"
	tokyo23ku = "tokyo23ku"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		if !w.Operator.IsUser() && w.Operator.IsIntegrationBy(conf.CMSIntegration) {
			log.Debugf("geospatialjp webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate && w.Type != cmswebhook.EventItemPublish {
			log.Debugf("geospatialjp webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
			log.Debugf("geospatialjp webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.ItemData.Model.Key != modelKey {
			log.Debugf("geospatialjp webhook: invalid model id: %s, key: %s", w.ItemData.Item.ModelID, w.ItemData.Model.Key)
			return nil
		}

		ctx := req.Context()
		item := ItemFrom(*w.ItemData.Item)

		var err error
		var act string
		if w.Type == cmswebhook.EventItemPublish {
			// publish event: create resources to ckan
			act = "create resources to ckan"
			err = s.RegisterCkanResources(ctx, item)

			if err != nil {
				comment := fmt.Sprintf("G空間情報センターへの登録処理でエラーが発生しました。%s", err)
				s.commentToItem(ctx, item.ID, comment)
			} else {
				s.commentToItem(ctx, item.ID, "G空間情報センターへの登録が完了しました")
			}
		} else {
			if item.CatalogStatus != "" && item.CatalogStatus != StatusReady {
				log.Infof("geospatialjp webhook: skipped: status is %s", item.CatalogStatus)
				return nil
			}

			// create or update event: check the catalog file
			act = "check catalog"
			err = s.CheckCatalog(ctx, w.ItemData.Schema.ProjectID, item)

			if err != nil {
				comment := fmt.Sprintf("目録ファイルの検査でエラーが発生しました。%s", err)
				s.commentToItem(ctx, item.ID, comment)

				// update item
				if _, err2 := s.CMS.UpdateItem(ctx, item.ID, Item{
					CatalogStatus: StatusError,
				}.Fields()); err2 != nil {
					log.Errorf("failed to update item %s: %s", item.ID, err2)
				}
			} else {
				s.commentToItem(ctx, item.ID, "目録ファイルの検査が完了しました。エラーはありません。")
			}
		}

		if err != nil {
			log.Errorf("geospatialjp webhook: failed to %s: %s", act, err)
		}

		log.Infof("geospatialjp webhook: done")
		return nil
	}, nil
}

func (s *Services) CheckCatalog(ctx context.Context, projectID string, i Item) error {
	// update item
	if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
		CatalogStatus: StatusProcessing,
	}.Fields()); err != nil {
		return fmt.Errorf("failed to update item %s: %w", i.ID, err)
	}

	// get catalog url
	catalogAsset, err := s.CMS.Asset(ctx, i.Catalog)
	if err != nil {
		return fmt.Errorf("目録アセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}

	// parse catalog
	c, cf, err := s.parseCatalog(ctx, catalogAsset.URL)
	if err != nil {
		return err
	}

	log.Infof("geospatialjp: catalog: %+v", c)

	// validate catalog
	if err := c.Validate(); err != nil {
		return err
	}

	// delete sheet
	if err := cf.DeleteSheet(); err != nil {
		return fmt.Errorf("failed to delete sheet from catalog: %w", err)
	}

	// update item
	if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
		CatalogStatus: StatusOK,
	}.Fields()); err != nil {
		return fmt.Errorf("failed to update item %s: %w", i.ID, err)
	}

	return nil
}

func (s *Services) RegisterCkanResources(ctx context.Context, i Item) error {
	if i.Catalog == "" {
		return errors.New("「目録ファイル」が登録されていません。")
	}

	if i.All == "" {
		return errors.New("「全データ」が登録されていません。CityGMLの3D Tiles等への変換が正常に完了しているか確認してください。")
	}

	// get citygml asset
	cityGMLAssetID := i.CityGMLGeoSpatialJP
	if cityGMLAssetID == "" {
		cityGMLAssetID = i.CityGML
	}
	if cityGMLAssetID == "" {
		return errors.New("「CityGML」が登録されていません。")
	}

	citygmlAsset, err := s.CMS.Asset(ctx, cityGMLAssetID)
	if err != nil {
		return fmt.Errorf("CityGMLアセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}

	cityCode, cityName, err := extractCityName(citygmlAsset.URL)
	if err != nil {
		return fmt.Errorf("CityGMLのzipファイル名から市区町村コードまたは市区町村英名を読み取ることができませんでした。ファイル名の形式が正しいか確認してください。: %w", err)
	}

	log.Infof("geospatialjp: citygml: code=%s name=%s", cityCode, cityName)

	// get all url
	allAsset, err := s.CMS.Asset(ctx, i.All)
	if err != nil {
		return fmt.Errorf("全データアセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}

	// get catalog url
	catalogAsset, err := s.CMS.Asset(ctx, i.Catalog)
	if err != nil {
		return fmt.Errorf("目録アセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}
	catalogAssetURL, err := url.Parse(catalogAsset.URL)
	if err != nil {
		return fmt.Errorf("目録アセットのURLが不正です: %w", err)
	}
	catalogFileName := path.Base(catalogAssetURL.Path)

	// parse catalog
	c, xf, err := s.parseCatalog(ctx, catalogAsset.URL)
	if err != nil {
		return err
	}
	log.Infof("geospatialjp: catalog: %+v", c)

	// find or create package
	pkg, err := s.findAndUpdateOrCreatePackage(ctx, c, cityCode, cityName)
	if err != nil {
		return err
	}
	log.Infof("geospatialjp: find or create package: %+v", pkg)

	// delete sheet
	if err := xf.DeleteSheet(); err != nil {
		return fmt.Errorf("目録からG空間情報センター用メタデータのシートを削除できませんでした。: %w", err)
	}
	catalogData, err := xf.File().WriteToBuffer()
	if err != nil {
		return fmt.Errorf("目録ファイルの書き出しに失敗しました。: %w", err)
	}

	// save catalog resource
	catalogResource, _ := findResource(pkg, ResourceNameCatalog, "XLSX", "", "")
	if _, err = s.Ckan.UploadResource(ctx, catalogResource, catalogFileName, catalogData.Bytes()); err != nil {
		return fmt.Errorf("G空間情報センターへの目録リソースの登録に失敗しました。: %w", err)
	}

	// save citygml resoruce
	citygmlResource, needUpdate := findResource(pkg, ResourceNameCityGML, "ZIP", "", citygmlAsset.URL)
	if needUpdate {
		if _, err = s.Ckan.SaveResource(ctx, citygmlResource); err != nil {
			return fmt.Errorf("G空間情報センターへのCityGMLリソースの登録に失敗しました。: %w", err)
		}
	} else {
		log.Infof("geospatialjp: updating citygml resource was skipped")
	}

	// save all resource
	allResource, needUpdate := findResource(pkg, ResourceNameAll, "ZIP", "", allAsset.URL)
	if needUpdate {
		if _, err = s.Ckan.SaveResource(ctx, allResource); err != nil {
			return fmt.Errorf("G空間情報センターへの全データリソースの登録に失敗しました。: %w", err)
		}
	} else {
		log.Infof("geospatialjp: updating all resource was skipped")
	}

	return nil
}

func (s *Services) parseCatalog(ctx context.Context, catalogURL string) (c Catalog, cf *CatalogFile, _ error) {
	catalogAssetRes, err := http.DefaultClient.Do(util.DR(
		http.NewRequestWithContext(ctx, http.MethodGet, catalogURL, nil)))
	if err != nil {
		return c, cf, fmt.Errorf("アセットの取得に失敗しました: %w", err)
	}
	if catalogAssetRes.StatusCode != 200 {
		return c, cf, fmt.Errorf("アセットの取得に失敗しました: ステータスコード %d", catalogAssetRes.StatusCode)
	}

	defer catalogAssetRes.Body.Close()

	// parse catalog
	xf, err := excelize.OpenReader(catalogAssetRes.Body)
	if err != nil {
		return c, cf, fmt.Errorf("目録を開くことできませんでした: %w", err)
	}

	cf = NewCatalogFile(xf)
	c, err = cf.Parse()
	if err != nil {
		return c, cf, fmt.Errorf("目録の読み込みに失敗しました: %w", err)
	}

	return c, cf, nil
}

func (s *Services) findAndUpdateOrCreatePackage(ctx context.Context, c Catalog, cityCode, cityName string) (*ckan.Package, error) {
	// find
	pkg, pkgName, err := s.findPackage(ctx, cityCode, cityName)
	if err != nil {
		return nil, fmt.Errorf("G空間情報センターからデータセットを検索できませんでした: %w", err)
	}

	newpkg := lo.ToPtr(packageFromCatalog(c, s.CkanOrg, pkgName, s.CkanPrivate))

	// create
	if pkg == nil {
		log.Infof("geospartialjp: package plateau-%s-%s-202x not found so new package will be created", cityCode, cityName)

		pkg2, err := s.Ckan.CreatePackage(ctx, *newpkg)
		if err != nil {
			return nil, fmt.Errorf("G空間情報センターにデータセット %s を作成できませんでした: %w", pkgName, err)
		}
		return &pkg2, nil
	}

	// update
	newpkg.ID = pkg.ID
	pkg2, err := s.Ckan.PatchPackage(ctx, *newpkg)
	if err != nil {
		return nil, fmt.Errorf("G空間情報センターのデータセット %s を更新できませんでした: %w", pkgName, err)
	}

	return &pkg2, nil
}

func (s *Services) findPackage(ctx context.Context, cityCode, cityName string) (_ *ckan.Package, n string, err error) {
	if s.CkanPrivate && cityName != tokyo23ku {
		// search API is not useful for private packages
		initialYear := 2020
		currentYear := util.Now().Year()
		for y := initialYear; y <= currentYear; y++ {
			p, _ := s.Ckan.ShowPackage(ctx, fmt.Sprintf("plateau-%s-%s-%d", cityCode, cityName, y))
			if p.Name != "" {
				return &p, p.Name, nil
			}
		}
		return nil, fmt.Sprintf("plateau-%s-%s-%d", cityCode, cityName, currentYear), nil
	}

	var q string
	if cityName == tokyo23ku {
		q = "plateau-tokyo23ku"
		n = q
	} else {
		q = fmt.Sprintf("plateau-%s-%s-*", cityCode, cityName)
		n = fmt.Sprintf("plateau-%s-%s-%s", cityCode, cityName, util.Now().Format("2006"))
	}

	p, err := s.Ckan.SearchPackageByName(ctx, q)
	if err != nil {
		return nil, "", err
	}

	if !p.IsEmpty() {
		pkg := &p.Results[0]
		return pkg, pkg.Name, nil
	}

	return nil, n, nil
}

func (s *Services) commentToItem(ctx context.Context, itemID, comment string) {
	if err2 := s.CMS.CommentToItem(ctx, itemID, comment); err2 != nil {
		log.Errorf("failed to comment to item %s: %s", itemID, err2)
	}
}

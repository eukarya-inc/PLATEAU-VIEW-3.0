package datacatalog

import (
	"fmt"
	"sort"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/samber/lo"
)

func (i PlateauItem) BridItem(c PlateauIntermediateItem) *DataCatalogItem {
	if len(i.Brid) == 0 {
		return nil
	}

	data := lo.Map(i.Brid, func(a *cms.PublicAsset, i int) DataCatalogItemConfigItem {
		an := AssetNameFrom(a.URL)
		name := ""
		if an.LOD != "" {
			name = fmt.Sprintf("LOD%s", an.LOD)
		} else {
			name = fmt.Sprintf("橋梁%d", i)
		}

		return DataCatalogItemConfigItem{
			Name: name,
			URL:  assetURLFromFormat(a.URL, an.Format),
			Type: an.Format,
		}
	})
	sort.Slice(data, func(a, b int) bool {
		return strings.Compare(data[a].Name, data[b].Name) < 0
	})

	an := AssetNameFrom(i.Brid[0].URL)
	dci := c.DataCatalogItem("橋梁モデル", an, i.Brid[0].URL, i.DescriptionBrid, nil, false)
	dci.Config = DataCatalogItemConfig{
		Data: data,
	}

	return dci
}

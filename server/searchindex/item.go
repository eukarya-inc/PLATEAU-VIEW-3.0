package searchindex

import "github.com/eukarya-inc/reearth-plateauview/server/cms"

type Status string

const (
	StatusReady      Status = "未実行"
	StatusProcessing Status = "実行中"
	StatusOK         Status = "完了"
	StatusError      Status = "エラー"
)

type Item struct {
	ID string `json:"id,omitempty"`
	// asset: bldg
	Bldg []string `json:"bldg,omitempty"`
	// asset: search_index
	SearchIndex []string `json:"search_index,omitempty"`
	// select: search_index_status: 未実行, 実行中, 完了, エラー
	SeatchIndexStatus Status `json:"search_index_status,omitempty"`
}

func (i Item) Fields() (fields []cms.Field) {
	if i.Bldg != nil {
		fields = append(fields, cms.Field{
			Key:   "bldg",
			Type:  "asset",
			Value: i.Bldg,
		})
	}

	if i.SearchIndex != nil {
		fields = append(fields, cms.Field{
			Key:   "search_index",
			Type:  "asset",
			Value: i.SearchIndex,
		})
	}

	if i.SeatchIndexStatus != "" {
		fields = append(fields, cms.Field{
			Key:   "search_index_status",
			Type:  "select",
			Value: string(i.SeatchIndexStatus),
		})
	}

	return
}

func ItemFrom(item cms.Item) (i Item) {
	i.ID = item.ID

	if v := item.FieldByKey("bldg").ValueStrings(); v != nil {
		i.Bldg = v
	}

	if v := item.FieldByKey("search_index").ValueStrings(); v != nil {
		i.SearchIndex = v
	}

	if v := item.FieldByKey("search_index_status").ValueString(); v != nil {
		i.SeatchIndexStatus = Status(*v)
	}

	return
}

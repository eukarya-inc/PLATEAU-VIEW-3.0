package sdk

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
	// asset: citygml
	CityGML string `json:"citygml,omitempty"`
	// asset: max_lod
	MaxLOD string `json:"max_lod,omitempty"`
	// select: max_lod_status: 未実行, 実行中, 完了, エラー
	MaxLODStatus Status `json:"max_lod_status,omitempty"`
}

func (i Item) Fields() (fields []cms.Field) {
	if i.CityGML != "" {
		fields = append(fields, cms.Field{
			Key:   "citygml",
			Type:  "asset",
			Value: i.CityGML,
		})
	}

	if i.MaxLOD != "" {
		fields = append(fields, cms.Field{
			Key:   "max_lod",
			Type:  "asset",
			Value: i.MaxLOD,
		})
	}

	if i.MaxLODStatus != "" {
		fields = append(fields, cms.Field{
			Key:   "max_lod_status",
			Type:  "select",
			Value: string(i.MaxLODStatus),
		})
	}

	return
}

func ItemFrom(item cms.Item) (i Item) {
	i.ID = item.ID

	if v := item.FieldByKey("citygml").ValueString(); v != nil {
		i.CityGML = *v
	}

	if v := item.FieldByKey("max_lod").ValueString(); v != nil {
		i.MaxLOD = *v
	}

	if v := item.FieldByKey("max_lod_status").ValueString(); v != nil {
		i.MaxLODStatus = Status(*v)
	}

	return
}

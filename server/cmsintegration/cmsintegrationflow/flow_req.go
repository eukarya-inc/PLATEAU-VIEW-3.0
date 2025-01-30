package cmsintegrationflow

import "encoding/json"

type FlowRequest struct {
	TriggerID       string
	NotificationURL string
	CityGMLURL      string
}

func (r FlowRequest) MarshalJSON() ([]byte, error) {
	m := map[string]any{
		"notificationURL": r.NotificationURL,
		"with": map[string]any{
			"cityGMLPath": r.CityGMLURL,
		},
	}

	return json.Marshal(m)
}

type FlowRequestResult struct {
	TriggerID string `json:"triggerId"`
}

package cmsintegrationflow

import "encoding/json"

type FlowRequest struct {
	TriggerID       string
	NotificationURL string
	AuthToken       string
	CityGMLURL      string
}

func (r FlowRequest) MarshalJSON() ([]byte, error) {
	m := map[string]any{
		"notificationURL": r.NotificationURL,
		"authToken":       r.AuthToken,
		"with": map[string]any{
			"cityGmlPath": r.CityGMLURL,
		},
	}
	return json.Marshal(m)
}

type FlowRequestResult map[string]any

package cmsintegrationflow

import (
	"path"
	"regexp"
	"strings"
)

type FlowResult struct {
	ID           string   `json:"-"`
	RunID        string   `json:"runId"`
	TriggerID    string   `json:"triggerId"`
	DeploymentID string   `json:"deploymentId"`
	Status       string   `json:"status"`
	Logs         []string `json:"logs"`
	Outputs      []string `json:"outputs"`
}

type FlowInternalResult struct {
	Conv     map[string][]string
	Dic      string
	MaxLOD   string
	QCResult string
}

func (r FlowResult) IsError() bool {
	return r.Status == "error"
}

func (r FlowResult) Internal() (res FlowInternalResult) {
	for _, output := range r.Outputs {
		base := path.Base(output)

		switch base {
		case "dic.json":
			res.Dic = output
			continue
		case "maxlod.csv":
			res.MaxLOD = output
			continue
		case "qc_result.xlsx":
			res.QCResult = output
			continue
		}

		key := getOutputKey(base)
		res.Conv[key] = append(res.Conv[key], output)
	}

	return
}

var reDigits = regexp.MustCompile(`^\d+_(.*)(?:\..+)?$`)

func getOutputKey(s string) string {
	k := reDigits.ReplaceAllString(s, "$1")
	k = strings.TrimSuffix(k, "_no_texture")
	k = strings.TrimSuffix(k, "_l1")
	k = strings.TrimSuffix(k, "_l2")
	k = strings.TrimSuffix(k, "_lod0")
	k = strings.TrimSuffix(k, "_lod1")
	k = strings.TrimSuffix(k, "_lod2")
	k = strings.TrimSuffix(k, "_lod3")
	k = strings.TrimSuffix(k, "_lod4")
	return k
}

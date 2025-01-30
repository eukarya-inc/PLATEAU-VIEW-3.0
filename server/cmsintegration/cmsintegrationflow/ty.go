package cmsintegrationflow

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/k0kubun/pp/v3"
)

func init() {
	pp.ColoringEnabled = false
}

type ReqType string

const (
	ReqTypeQC     ReqType = "qc"
	ReqTypeConv   ReqType = "conv"
	ReqTypeQcConv ReqType = "qc_conv"
)

func (t ReqType) Title() string {
	if t == ReqTypeConv {
		return "変換"
	} else if t == ReqTypeQC {
		return "品質検査"
	}
	return "品質検査・変換"
}

func (t ReqType) CMSStatus(s cmsintegrationcommon.ConvertionStatus) (qc cmsintegrationcommon.ConvertionStatus, conv cmsintegrationcommon.ConvertionStatus) {
	if t == ReqTypeConv {
		conv = s
	} else if t == ReqTypeQC {
		qc = s
	} else {
		qc = s
		conv = s
	}
	return
}

func ReqTypeFrom(skipQC, skipConv bool) ReqType {
	if skipQC && skipConv {
		return ""
	} else if skipQC {
		return ReqTypeConv
	} else if skipConv {
		return ReqTypeQC
	}
	return ReqTypeQcConv
}

func (t ReqType) IsQC() bool {
	return t == ReqTypeQC || t == ReqTypeQcConv
}

func (t ReqType) IsConv() bool {
	return t == ReqTypeConv || t == ReqTypeQcConv
}

package cmsintegration

type fmeResult struct {
	Type   string `json:"type"`
	Status string `json:"status"`
	ID     string `json:"id"`
	LogURL string `json:"logUrl"`
	// 建築物 (bldg, bldg_lod1, bldg_lod2, bldg_lod3) : 3D Tiles
	// 道路 (tran, tran_lod1, tran_lod2) : MVT (LOD1, LOD2)
	// 道路 (tran_lod3): 3D Tiles (LOD3)
	// 都市設備  (frn) : 3D Tiles
	// 植生(veg) : 3D Tiles
	// 浸水想定区域（洪水、津波、高潮、内水）(fld, tnum, htd, ifld) : 3D Tiles
	// 土地利用 (luse) : MVT
	// 都市計画決定情報 (urf) : MVT
	// 土砂災害警戒区域 (lsld) : MVT
	Results map[string]string `json:"results"`
}

func (b fmeResult) GetResult(keys ...string) string {
	for _, k := range keys {
		r, ok := b.Results[k]
		if ok {
			return r
		}
	}
	return ""
}

func (b fmeResult) GetResultFromAllLOD(key string) string {
	return b.GetResult(key+"_lod3", key+"_lod2", key+"_lod1", key)
}

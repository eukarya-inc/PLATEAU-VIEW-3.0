package plateauv2

type DataCatalogItem struct {
	ID          string   `json:"id,omitempty"`
	ItemID      string   `json:"itemId,omitempty"`
	Name        string   `json:"name,omitempty"`
	Pref        string   `json:"pref,omitempty"`
	PrefCode    string   `json:"pref_code,omitempty"`
	City        string   `json:"city,omitempty"`
	CityEn      string   `json:"city_en,omitempty"`
	CityCode    string   `json:"city_code,omitempty"`
	Ward        string   `json:"ward,omitempty"`
	WardEn      string   `json:"ward_en,omitempty"`
	WardCode    string   `json:"ward_code,omitempty"`
	Type        string   `json:"type,omitempty"`
	Type2       string   `json:"type2,omitempty"`
	TypeEn      string   `json:"type_en,omitempty"`
	Type2En     string   `json:"type2_en,omitempty"`
	Format      string   `json:"format,omitempty"`
	Layers      []string `json:"layers,omitempty"`
	URL         string   `json:"url,omitempty"`
	Description string   `json:"desc,omitempty"`
	SearchIndex string   `json:"search_index,omitempty"`
	Year        int      `json:"year,omitempty"`
	OpenDataURL string   `json:"openDataUrl,omitempty"`
	Config      any      `json:"config,omitempty"`
	Order       *int     `json:"order,omitempty"`
	Root        bool     `json:"root,omitempty"`
}

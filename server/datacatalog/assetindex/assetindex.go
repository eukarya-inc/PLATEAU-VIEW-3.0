// Package assetindex builds a dimension table that maps each Re:Earth CMS
// asset (identified by the two path segments after /assets/ in its URL) to
// what the asset is in the PLATEAU data catalog. It is meant to be joined with
// access logs of the CMS asset host, so the output has exactly one row per
// asset UUID and every catalog entry that points at the asset is listed in the
// row's refs.
package assetindex

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"sort"
	"strconv"
	"strings"

	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/datacatalogv3"
	"github.com/eukarya-inc/PLATEAU-VIEW/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

// Ref kinds. Dataset kinds come from dataset items, the others from the
// per-city CityGML entry and the files listed on G空間情報センター.
const (
	KindPlateauDataset         = "plateau_dataset"
	KindRelatedDataset         = "related_dataset"
	KindRelatedDatasetOriginal = "related_dataset_original"
	KindGenericDataset         = "generic_dataset"
	// KindCityGML is the per-city CityGML zip of the data catalog. CityGML
	// files extracted from it are served under the same UUID.
	KindCityGML         = "citygml"
	KindCityGMLFeature  = "citygml_feature"
	KindCityGMLMaxLOD   = "citygml_maxlod"
	KindCityGMLMetadata = "citygml_metadata"
	// The gspatialjp kinds are the files listed on the G空間情報センター
	// dataset page. KindGspatialjpCityGML is only emitted when that CityGML
	// zip differs from the CityGML entry URL, i.e. G空間情報センター still
	// distributes another (typically older) build.
	KindGspatialjpCityGML    = "gspatialjp_citygml"
	KindGspatialjp3DTilesMVT = "gspatialjp_3dtiles_mvt"
	KindGspatialjpRelated    = "gspatialjp_related"
	KindGspatialjpOther      = "gspatialjp_other"
)

// Row is one line of the NDJSON output.
type Row struct {
	// UUID is the asset UUID as it appears in the asset URL path:
	// "<uuid[0:2]>/<uuid[2:]>".
	UUID string `json:"uuid"`
	// URL is the asset base URL: "<scheme>://<host>/assets/<uuid[0:2]>/<uuid[2:]>".
	URL  string `json:"url"`
	Refs []*Ref `json:"refs"`
}

// Ref describes one catalog entry that points at an asset. Every field is
// always present (null when not applicable) so that BigQuery sees a stable
// schema.
type Ref struct {
	Kind    string `json:"kind"`
	Project string `json:"project"`
	// Stage is "ga", "beta" or "alpha".
	Stage            *string `json:"stage"`
	DatasetID        *string `json:"dataset_id"`
	DatasetName      *string `json:"dataset_name"`
	ItemID           *string `json:"item_id"`
	ItemName         *string `json:"item_name"`
	TypeCode         *string `json:"type_en"`
	Type             *string `json:"type"`
	PrefCode         *string `json:"pref_code"`
	Pref             *string `json:"pref"`
	CityCode         *string `json:"city_code"`
	City             *string `json:"city"`
	WardCode         *string `json:"ward_code"`
	Ward             *string `json:"ward"`
	Year             *int    `json:"year"`
	RegistrationYear *int    `json:"registration_year"`
	Spec             *string `json:"spec"`
	// Format is the data catalog format enum (e.g. "CESIUM3DTILES", "MVT",
	// "GEOJSON"), only for dataset kinds.
	Format   *string `json:"format"`
	LOD      *string `json:"lod"`
	Texture  *bool   `json:"texture"`
	FileSize *int64  `json:"file_size"`
	// URL is the URL as referenced by the catalog, which may point inside an
	// extracted zip (e.g. ".../<uuid>/<zip>/tileset.json").
	URL string `json:"url"`
}

// Project is a data catalog project (e.g. plateau-2025) and its repo.
type Project struct {
	Name string
	Repo plateauapi.Repo
}

// Result is the built index.
type Result struct {
	Rows []*Row
	// Refs is the total number of refs over all rows.
	Refs int
	// Skipped is the number of referenced URLs that are not CMS asset URLs.
	Skipped int
}

// ExtractAssetUUID returns the asset UUID ("ab/cdef...") and the asset base
// URL of a CMS asset URL such as
// https://assets.cms.plateau.reearth.io/assets/ab/cdef.../file.zip or a path
// inside the extracted zip. ok is false for any other URL.
func ExtractAssetUUID(rawURL string) (uuid, base string, ok bool) {
	u, err := url.Parse(strings.TrimSpace(rawURL))
	if err != nil || u.Host == "" || (u.Scheme != "http" && u.Scheme != "https") {
		return "", "", false
	}

	segs := strings.Split(strings.TrimPrefix(u.Path, "/"), "/")
	if len(segs) < 3 || segs[0] != "assets" || !isUUIDPart(segs[1], 2) || !isUUIDPart(segs[2], 34) {
		return "", "", false
	}

	uuid = strings.ToLower(segs[1] + "/" + segs[2])
	base = u.Scheme + "://" + u.Host + "/assets/" + uuid
	return uuid, base, true
}

// isUUIDPart reports whether s is a hex string (either case) with
// optional hyphens of length n.
func isUUIDPart(s string, n int) bool {
	if len(s) != n {
		return false
	}
	for _, c := range s {
		switch {
		case c == '-', '0' <= c && c <= '9', 'a' <= c && c <= 'f', 'A' <= c && c <= 'F':
		default:
			return false
		}
	}
	return true
}

// Build collects every asset URL known to the given projects. The repos are
// read as an admin so that entries of every stage are included; the stage is
// recorded on each ref.
func Build(ctx context.Context, projects []Project) (*Result, error) {
	ctx = datacatalogv3.AdminContext(ctx, true, true, true)
	b := newBuilder()
	for _, p := range projects {
		if p.Repo == nil {
			continue
		}
		if err := b.addProject(ctx, p); err != nil {
			return nil, fmt.Errorf("project %s: %w", p.Name, err)
		}
	}
	return b.result(), nil
}

type builder struct {
	rows    map[string]*Row
	seen    map[string]map[string]struct{}
	skipped int
}

func newBuilder() *builder {
	return &builder{
		rows: map[string]*Row{},
		seen: map[string]map[string]struct{}{},
	}
}

func (b *builder) add(r Ref) {
	if r.URL == "" {
		return
	}

	uuid, base, ok := ExtractAssetUUID(r.URL)
	if !ok {
		b.skipped++
		return
	}

	key, _ := json.Marshal(r)
	if b.seen[uuid] == nil {
		b.seen[uuid] = map[string]struct{}{}
	}
	if _, dup := b.seen[uuid][string(key)]; dup {
		return
	}
	b.seen[uuid][string(key)] = struct{}{}

	row := b.rows[uuid]
	if row == nil {
		row = &Row{UUID: uuid, URL: base}
		b.rows[uuid] = row
	} else if base < row.URL {
		// the same asset reachable from different hosts; keep it deterministic
		row.URL = base
	}
	ref := r
	row.Refs = append(row.Refs, &ref)
}

func (b *builder) result() *Result {
	res := &Result{Skipped: b.skipped}
	for _, row := range b.rows {
		sort.Slice(row.Refs, func(i, j int) bool { return refLess(row.Refs[i], row.Refs[j]) })
		res.Refs += len(row.Refs)
		res.Rows = append(res.Rows, row)
	}
	sort.Slice(res.Rows, func(i, j int) bool { return res.Rows[i].UUID < res.Rows[j].UUID })
	return res
}

func refLess(a, b *Ref) bool {
	ka := []string{a.Kind, a.Project, lo.FromPtr(a.DatasetID), lo.FromPtr(a.ItemID), a.URL}
	kb := []string{b.Kind, b.Project, lo.FromPtr(b.DatasetID), lo.FromPtr(b.ItemID), b.URL}
	for i := range ka {
		if ka[i] != kb[i] {
			return ka[i] < kb[i]
		}
	}
	// fall back to the full encoding so the order is total
	ja, _ := json.Marshal(a)
	jb, _ := json.Marshal(b)
	return string(ja) < string(jb)
}

// WriteNDJSON writes one JSON object per row.
func (r *Result) WriteNDJSON(w io.Writer) error {
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	for _, row := range r.Rows {
		if err := enc.Encode(row); err != nil {
			return err
		}
	}
	return nil
}

// resolver looks up names of areas, dataset types and specs with a cache,
// since many datasets share them.
type resolver struct {
	repo  plateauapi.Repo
	areas map[plateauapi.AreaCode]plateauapi.Area
	nodes map[plateauapi.ID]plateauapi.Node
}

func (r *resolver) area(ctx context.Context, code *plateauapi.AreaCode) (codeStr, name *string, _ error) {
	if code == nil || *code == "" {
		return nil, nil, nil
	}
	a, ok := r.areas[*code]
	if !ok {
		var err error
		a, err = r.repo.Area(ctx, *code)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to fetch area %s: %w", *code, err)
		}
		r.areas[*code] = a
	}
	codeStr = lo.ToPtr(code.String())
	if a != nil {
		name = lo.ToPtr(a.GetName())
	}
	return
}

func (r *resolver) node(ctx context.Context, id plateauapi.ID) (plateauapi.Node, error) {
	if id == "" {
		return nil, nil
	}
	if n, ok := r.nodes[id]; ok {
		return n, nil
	}
	n, err := r.repo.Node(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch node %s: %w", id, err)
	}
	r.nodes[id] = n
	return n, nil
}

func (r *resolver) typeName(ctx context.Context, id plateauapi.ID) (*string, error) {
	n, err := r.node(ctx, id)
	if err != nil {
		return nil, err
	}
	if t, ok := n.(plateauapi.DatasetType); ok && t != nil {
		return lo.ToPtr(t.GetName()), nil
	}
	return nil, nil
}

func (r *resolver) spec(ctx context.Context, id plateauapi.ID) (*string, error) {
	n, err := r.node(ctx, id)
	if err != nil {
		return nil, err
	}
	if s, ok := n.(*plateauapi.PlateauSpecMinor); ok && s != nil {
		return lo.ToPtr(s.Version), nil
	}
	return nil, nil
}

func (b *builder) addProject(ctx context.Context, p Project) error {
	r := &resolver{
		repo:  p.Repo,
		areas: map[plateauapi.AreaCode]plateauapi.Area{},
		nodes: map[plateauapi.ID]plateauapi.Node{},
	}

	datasets, err := p.Repo.Datasets(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to fetch datasets: %w", err)
	}

	for _, d := range datasets {
		if err := b.addDataset(ctx, r, p.Name, d); err != nil {
			return err
		}
	}

	citygmls, err := p.Repo.CitygmlDatasets(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to fetch citygml datasets: %w", err)
	}

	for _, d := range citygmls {
		if err := b.addCityGML(ctx, r, p.Name, d); err != nil {
			return err
		}
	}

	return nil
}

func (b *builder) addDataset(ctx context.Context, r *resolver, project string, d plateauapi.Dataset) error {
	common := Ref{
		Project:          project,
		Stage:            stage(d.GetAdmin()),
		DatasetID:        lo.ToPtr(string(d.GetID())),
		DatasetName:      lo.ToPtr(d.GetName()),
		Year:             lo.ToPtr(d.GetYear()),
		RegistrationYear: lo.ToPtr(d.GetRegisterationYear()),
	}

	var prefCode, cityCode, wardCode *plateauapi.AreaCode
	var specID plateauapi.ID
	switch t := d.(type) {
	case *plateauapi.PlateauDataset:
		common.Kind = KindPlateauDataset
		common.TypeCode = lo.ToPtr(t.TypeCode)
		prefCode, cityCode, wardCode = t.PrefectureCode, t.CityCode, t.WardCode
		specID = t.PlateauSpecMinorID
	case *plateauapi.RelatedDataset:
		common.Kind = KindRelatedDataset
		common.TypeCode = lo.ToPtr(t.TypeCode)
		prefCode, cityCode, wardCode = t.PrefectureCode, t.CityCode, t.WardCode
	case *plateauapi.GenericDataset:
		common.Kind = KindGenericDataset
		common.TypeCode = lo.ToPtr(t.TypeCode)
		prefCode, cityCode, wardCode = t.PrefectureCode, t.CityCode, t.WardCode
	default:
		return nil
	}

	var err error
	if common.PrefCode, common.Pref, err = r.area(ctx, prefCode); err != nil {
		return err
	}
	if common.CityCode, common.City, err = r.area(ctx, cityCode); err != nil {
		return err
	}
	if common.WardCode, common.Ward, err = r.area(ctx, wardCode); err != nil {
		return err
	}
	if common.Type, err = r.typeName(ctx, d.GetTypeID()); err != nil {
		return err
	}
	if specID != "" {
		if common.Spec, err = r.spec(ctx, specID); err != nil {
			return err
		}
	}

	for _, it := range d.GetItems() {
		ref := common
		ref.ItemID = lo.ToPtr(string(it.GetID()))
		ref.ItemName = lo.ToPtr(it.GetName())
		ref.URL = it.GetURL()
		ref.Format = lo.ToPtr(string(it.GetFormat()))

		switch i := it.(type) {
		case *plateauapi.PlateauDatasetItem:
			ref.FileSize = intToInt64Ptr(i.FileSize)
			if i.Lod != nil {
				ref.LOD = lo.ToPtr(strconv.Itoa(*i.Lod))
			}
			ref.Texture = texture(i.Texture)
		case *plateauapi.RelatedDatasetItem:
			ref.FileSize = intToInt64Ptr(i.FileSize)
			if i.OriginalURL != nil && *i.OriginalURL != "" {
				orig := ref
				orig.Kind = KindRelatedDatasetOriginal
				orig.URL = *i.OriginalURL
				orig.FileSize = intToInt64Ptr(i.OriginalFileSize)
				orig.Format = nil
				if i.OriginalFormat != nil {
					orig.Format = lo.ToPtr(string(*i.OriginalFormat))
				}
				b.add(orig)
			}
		case *plateauapi.GenericDatasetItem:
			ref.FileSize = intToInt64Ptr(i.FileSize)
		}

		b.add(ref)
	}

	return nil
}

func (b *builder) addCityGML(ctx context.Context, r *resolver, project string, d *plateauapi.CityGMLDataset) error {
	if d == nil {
		return nil
	}

	common := Ref{
		Project:          project,
		Stage:            stage(d.Admin),
		DatasetID:        lo.ToPtr(string(d.ID)),
		Year:             lo.ToPtr(d.Year),
		RegistrationYear: lo.ToPtr(d.RegistrationYear),
	}

	var err error
	if common.PrefCode, common.Pref, err = r.area(ctx, lo.EmptyableToPtr(d.PrefectureCode)); err != nil {
		return err
	}
	if common.CityCode, common.City, err = r.area(ctx, lo.EmptyableToPtr(d.CityCode)); err != nil {
		return err
	}
	if common.Spec, err = r.spec(ctx, d.PlateauSpecMinorID); err != nil {
		return err
	}

	with := func(kind, u string, size *int64, name *string) Ref {
		ref := common
		ref.Kind = kind
		ref.URL = u
		ref.FileSize = size
		ref.ItemName = name
		return ref
	}

	b.add(with(KindCityGML, d.URL, intToInt64Ptr(d.FileSize), nil))

	for _, u := range d.MetadataZipUrls {
		b.add(with(KindCityGMLMetadata, u, nil, nil))
	}

	admin := plateauapi.AdminFrom(d.Admin)
	for _, u := range admin.CityGMLURLs {
		if u == d.URL {
			continue
		}
		b.add(with(KindCityGMLFeature, u, nil, nil))
	}
	for _, u := range admin.MaxLODURLs {
		b.add(with(KindCityGMLMaxLOD, u, nil, nil))
	}

	for _, f := range d.GspatialjpFiles {
		if f == nil {
			continue
		}
		var size *int64
		if f.FileSize > 0 {
			size = lo.ToPtr(f.FileSize)
		}
		var kind string
		switch f.Kind {
		case plateauapi.GspatialjpFileKindCityGML:
			if f.URL == d.URL {
				continue
			}
			kind = KindGspatialjpCityGML
		case plateauapi.GspatialjpFileKind3DTilesMVT:
			kind = KindGspatialjp3DTilesMVT
		case plateauapi.GspatialjpFileKindRelated:
			kind = KindGspatialjpRelated
		case plateauapi.GspatialjpFileKindOther:
			kind = KindGspatialjpOther
		default:
			continue
		}
		b.add(with(kind, f.URL, size, lo.EmptyableToPtr(f.Name)))
	}

	return nil
}

// stage returns the publication stage recorded in the admin data. Entries
// without a stage are generally available.
func stage(admin any) *string {
	s := plateauapi.AdminFrom(admin).Stage
	if s == "" {
		s = "ga"
	}
	return &s
}

func texture(t *plateauapi.Texture) *bool {
	if t == nil {
		return nil
	}
	switch *t {
	case plateauapi.TextureTexture:
		return lo.ToPtr(true)
	case plateauapi.TextureNone:
		return lo.ToPtr(false)
	}
	return nil
}

func intToInt64Ptr(v *int) *int64 {
	if v == nil {
		return nil
	}
	return lo.ToPtr(int64(*v))
}

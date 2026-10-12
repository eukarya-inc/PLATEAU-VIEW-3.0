package ckan

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
)

// packageResourcesFields is the fl parameter of SearchPackageResources. The
// res_* fields are the per-resource values CKAN indexes into Solr, which keeps
// the response small: a full package also carries thumbnail_url, which can be
// a data URI of hundreds of kilobytes.
const packageResourcesFields = "name,num_resources,res_name,res_url,res_format"

// SearchPackagesQuery is a package_search query. Zero values are omitted.
type SearchPackagesQuery struct {
	// FQ is the Solr filter query, e.g. "organization:toshi".
	FQ string
	// Sort is e.g. "id asc". Set it to a unique, immutable field when paging
	// so that pages do not overlap.
	Sort  string
	Rows  int
	Start int
}

func (q SearchPackagesQuery) params() map[string]string {
	p := map[string]string{}
	if q.FQ != "" {
		p["fq"] = q.FQ
	}
	if q.Sort != "" {
		p["sort"] = q.Sort
	}
	if q.Rows > 0 {
		p["rows"] = strconv.Itoa(q.Rows)
	}
	if q.Start > 0 {
		p["start"] = strconv.Itoa(q.Start)
	}
	return p
}

// PackageResources is a package_search result limited to the package name
// and the name, URL and format of its resources.
type PackageResources struct {
	Name         string   `json:"name"`
	NumResources solrInt  `json:"num_resources"`
	ResName      []string `json:"res_name"`
	ResURL       []string `json:"res_url"`
	ResFormat    []string `json:"res_format"`
	// Resources is only set when the server ignores fl and returns full
	// packages.
	Resources []Resource `json:"resources"`
}

// ResourceList returns the resources of the package in their order on the
// dataset page. ok is false when the res_* arrays cannot be paired up: Solr
// drops empty values (e.g. a resource without a URL) from multi-valued fields,
// which shifts the following entries. Callers should then fetch the package
// with ShowPackage.
func (p PackageResources) ResourceList() (_ []Resource, ok bool) {
	if len(p.Resources) > 0 {
		return p.Resources, true
	}

	n := int(p.NumResources)
	if len(p.ResName) != n || len(p.ResURL) != n || len(p.ResFormat) != n {
		return nil, false
	}

	res := make([]Resource, 0, n)
	for i := 0; i < n; i++ {
		res = append(res, Resource{Name: p.ResName[i], URL: p.ResURL[i], Format: p.ResFormat[i]})
	}
	return res, true
}

// SearchPackageResources runs package_search returning PackageResources.
func (c *Ckan) SearchPackageResources(ctx context.Context, q SearchPackagesQuery) (List[PackageResources], error) {
	params := q.params()
	params["fl"] = packageResourcesFields

	res := Response[List[PackageResources]]{}
	if err := c.send(ctx, "GET", []string{"api", "3", "action", "package_search"}, params, "", 0, nil, &res); err != nil {
		return res.Result, fmt.Errorf("failed to search packages: %w", err)
	}
	return res.Result, nil
}

// solrInt is an integer that Solr may return as a single-element array when
// the field is requested with fl.
type solrInt int

func (i *solrInt) UnmarshalJSON(b []byte) error {
	var n int
	if err := json.Unmarshal(b, &n); err == nil {
		*i = solrInt(n)
		return nil
	}

	var a []int
	if err := json.Unmarshal(b, &a); err != nil {
		return fmt.Errorf("invalid integer: %s", b)
	}
	if len(a) > 0 {
		*i = solrInt(a[0])
	} else {
		*i = 0
	}
	return nil
}

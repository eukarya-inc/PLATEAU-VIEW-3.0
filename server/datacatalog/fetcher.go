package datacatalog

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strconv"

	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const ModelPlateau = "plateau"
const ModelUsecase = "usecase"
const ModelDataset = "dataset"

type Config struct {
	CMSBase    string
	CMSProject string
}

type Fetcher struct {
	c    *http.Client
	base *url.URL
}

func NewFetcher(c *http.Client, config Config) (*Fetcher, error) {
	u, err := url.Parse(config.CMSBase)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "api", "p", config.CMSProject)

	if c == nil {
		c = http.DefaultClient
	}

	return &Fetcher{
		c:    c,
		base: u,
	}, nil
}

func (f *Fetcher) Clone() *Fetcher {
	if f == nil {
		return nil
	}
	return &Fetcher{
		c:    f.c,
		base: util.CloneRef(f.base),
	}
}

func (f *Fetcher) Do(ctx context.Context) (ResponseAll, error) {
	resultPlateau := make(chan ResponseAll)
	resultUsecase := make(chan ResponseAll)
	resultDataset := make(chan ResponseAll)
	errPlateau := make(chan error)
	errUsecase := make(chan error)
	errDataset := make(chan error)
	f1, f2, f3 := f.Clone(), f.Clone(), f.Clone()

	go func() {
		r, err := f1.all(ctx, ModelPlateau)
		errPlateau <- err
		resultPlateau <- r
	}()

	go func() {
		r, err := f2.all(ctx, ModelUsecase)
		errUsecase <- err
		resultUsecase <- r
	}()

	go func() {
		r, err := f3.all(ctx, ModelDataset)
		errDataset <- err
		resultDataset <- r
	}()

	if err := <-errPlateau; err != nil {
		return ResponseAll{}, err
	}

	if err := <-errUsecase; err != nil {
		return ResponseAll{}, err
	}

	if err := <-errDataset; err != nil {
		return ResponseAll{}, err
	}

	resPlateau := <-resultPlateau
	resUsecase := <-resultUsecase
	resDataset := <-resultDataset
	return ResponseAll{
		Plateau: append(append(resPlateau.Plateau, resUsecase.Plateau...), resDataset.Plateau...),
		Usecase: append(append(resPlateau.Usecase, resUsecase.Usecase...), resDataset.Usecase...),
	}, nil
}

func (f *Fetcher) all(ctx context.Context, model string) (resp ResponseAll, err error) {
	for p := 1; ; p++ {
		r, err := f.get(ctx, model, p, 0)
		if err != nil {
			return ResponseAll{}, err
		}

		resp.Plateau = append(resp.Plateau, r.Plateau...)
		resp.Usecase = append(resp.Usecase, r.Usecase...)
		if !r.HasNext() {
			break
		}
	}
	return
}

func (f *Fetcher) get(ctx context.Context, model string, page, perPage int) (r response, err error) {
	if f.c == nil {
		f.c = http.DefaultClient
	}

	r.Model = model
	if perPage == 0 {
		perPage = 100
	}

	req, err := http.NewRequestWithContext(ctx, "GET", f.url(model, page, perPage), nil)
	if err != nil {
		return
	}

	res, err := f.c.Do(req)
	if err != nil {
		return
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != http.StatusOK {
		err = fmt.Errorf("status code: %d", res.StatusCode)
		return
	}

	err = json.NewDecoder(res.Body).Decode(&r)
	r.Page = page
	r.PerPage = perPage
	return
}

func (f *Fetcher) url(model string, page, perPage int) string {
	u := util.CloneRef(f.base)
	u.Path = path.Join(u.Path, model)
	u.RawQuery = url.Values{
		"page":    []string{strconv.Itoa(page)},
		"perPage": []string{strconv.Itoa(perPage)},
	}.Encode()
	return u.String()
}

type response responseInternal

type responseInternal struct {
	Model      string          `json:"-"`
	Results    json.RawMessage `json:"results"`
	Plateau    []PlateauItem   `json:"-"`
	Usecase    []UsecaseItem   `json:"-"`
	Page       int             `json:"page"`
	PerPage    int             `json:"perPage"`
	TotalCount int             `json:"totalCount"`
}

func (r *response) UnmarshalJSON(data []byte) error {
	r2 := responseInternal{}
	if err := json.Unmarshal(data, &r2); err != nil {
		return err
	}

	if r.Model == ModelPlateau {
		if err := json.Unmarshal(r2.Results, &r2.Plateau); err != nil {
			return err
		}
	} else if r.Model == ModelUsecase || r.Model == ModelDataset {
		if err := json.Unmarshal(r2.Results, &r2.Usecase); err != nil {
			return err
		}
	}

	if r.Model == ModelUsecase {
		r2.Usecase = lo.Map(r2.Usecase, func(r UsecaseItem, _ int) UsecaseItem {
			r.Type = "ユースケース"
			return r
		})
	}

	r2.Results = nil
	*r = response(r2)
	return nil
}

func (r response) HasNext() bool {
	if r.PerPage == 0 {
		return false
	}
	return r.TotalCount > r.Page*r.PerPage
}

func (r response) DataCatalogs() []DataCatalogItem {
	if r.Plateau != nil {
		return lo.FlatMap(r.Plateau, func(i PlateauItem, _ int) []DataCatalogItem {
			return i.DataCatalogItems()
		})
	}
	if r.Usecase != nil {
		return lo.FlatMap(r.Usecase, func(i UsecaseItem, _ int) []DataCatalogItem {
			return i.DataCatalogs()
		})
	}
	return nil
}

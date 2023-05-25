package cms

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"time"

	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type PublicAPIClient[T any] struct {
	c       *http.Client
	base    *url.URL
	timeout time.Duration
}

func NewPublicAPIClient[T any](c *http.Client, base string) (*PublicAPIClient[T], error) {
	if c == nil {
		c = http.DefaultClient
	}
	u, err := url.Parse(base)
	if err != nil {
		return nil, err
	}
	return &PublicAPIClient[T]{
		c:    c,
		base: u,
	}, nil
}

func (c *PublicAPIClient[T]) WithTimeout(t time.Duration) *PublicAPIClient[T] {
	return &PublicAPIClient[T]{
		c:       c.c,
		base:    c.base,
		timeout: t,
	}
}

func (c *PublicAPIClient[T]) Clone() *PublicAPIClient[T] {
	return &PublicAPIClient[T]{
		c:       c.c,
		base:    c.base,
		timeout: c.timeout,
	}
}

func (c *PublicAPIClient[T]) GetAllItems(ctx context.Context, project, model string) (res []T, err error) {
	perPage := 100

	for p := 1; ; p++ {
		r, err := c.GetItems(ctx, project, model, p, perPage)
		if err != nil {
			return nil, err
		}

		res = append(res, r.Results...)
		if !r.HasNext() {
			break
		}
	}

	return
}

func (c *PublicAPIClient[T]) GetAllItemsInParallel(ctx context.Context, project, model string, limit int) ([]T, error) {
	perPage := 100

	r, err := parallel(limit, func(i int) ([]T, int, error) {
		r, err := c.GetItems(ctx, project, model, i+1, perPage)
		if err != nil {
			return nil, 0, err
		}
		return r.Results, int(math.Ceil(float64(r.TotalCount) / float64(perPage))), nil
	})

	if len(r) == 0 {
		return nil, err
	}
	return lo.Flatten(r), err
}

func (c *PublicAPIClient[T]) GetItems(ctx context.Context, project, model string, page, perPage int) (_ *PublicAPIListResponse[T], err error) {
	u := util.CloneRef(c.base)
	u.Path = path.Join(u.Path, "api", "p", project, model)
	q := url.Values{}
	if page > 0 {
		q.Set("page", strconv.Itoa(page))
	}
	if perPage > 0 {
		q.Set("per_page", strconv.Itoa(perPage))
	}
	u.RawQuery = q.Encode()

	var r PublicAPIListResponse[T]
	if err := c.send(ctx, "GET", u.String(), nil, &r); err != nil {
		return nil, err
	}

	r.Page = page
	r.PerPage = perPage
	return &r, nil
}

func (c *PublicAPIClient[T]) GetItem(ctx context.Context, project, model string, id string) (T, error) {
	u := util.CloneRef(c.base)
	u.Path = path.Join(u.Path, "api", "p", project, model, id)

	var r T
	err := c.send(ctx, "GET", u.String(), nil, &r)
	return r, err
}

func (c *PublicAPIClient[T]) GetAsset(ctx context.Context, project, id string) (*PublicAsset, error) {
	u := util.CloneRef(c.base)
	u.Path = path.Join(u.Path, "api", "p", project, "assets", id)

	var r PublicAsset
	if err := c.send(ctx, "GET", u.String(), nil, &r); err != nil {
		return nil, err
	}

	return &r, nil
}

func (c *PublicAPIClient[T]) send(ctx context.Context, method, url string, body io.Reader, resb any) error {
	ctx2 := ctx
	if c.timeout > 0 {
		ctx3, cancel := context.WithTimeout(context.Background(), c.timeout)
		ctx2 = ctx3
		defer cancel()
	}

	req, err := http.NewRequestWithContext(ctx2, method, url, body)
	if err != nil {
		return err
	}

	res, err := c.c.Do(req)
	if err != nil {
		return err
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != http.StatusOK {
		if res.StatusCode == http.StatusNotFound {
			err = rerror.ErrNotFound
		} else {
			err = fmt.Errorf("invalid status code: %d", res.StatusCode)
		}
		return err
	}

	if err := json.NewDecoder(res.Body).Decode(&resb); err != nil {
		return err
	}

	return nil
}

func ChangePublicAPIClientType[T, K any](c *PublicAPIClient[T]) *PublicAPIClient[K] {
	if c == nil {
		return nil
	}
	return &PublicAPIClient[K]{
		c:       c.c,
		base:    c.base,
		timeout: c.timeout,
	}
}

type PublicAPIListResponse[T any] struct {
	Results    []T `json:"results"`
	PerPage    int `json:"perPage"`
	Page       int `json:"page"`
	TotalCount int `json:"totalCount"`
}

func (r PublicAPIListResponse[T]) HasNext() bool {
	if r.PerPage == 0 {
		return false
	}
	return r.TotalCount > r.Page*r.PerPage
}

type PublicAsset struct {
	Type                    string   `json:"type,omitempty"`
	ID                      string   `json:"id,omitempty"`
	URL                     string   `json:"url,omitempty"`
	Files                   []string `json:"files,omitempty"`
	ContentType             string   `json:"contentType,omitempty"`
	ArchiveExtractionStatus string   `json:"archiveExtractionStatus,omitempty"`
}

func (a PublicAsset) IsExtractionDone() bool {
	return a.ArchiveExtractionStatus == "done"
}

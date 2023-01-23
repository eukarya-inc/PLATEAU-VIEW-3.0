package cms

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/reearth/reearthx/rerror"
)

type publicAPIListResponse[T any] struct {
	Results []T `json:"results"`
}

type PublicAsset struct {
	ID    string   `json:"id"`
	URL   string   `json:"url"`
	Files []string `json:"files"`
}

type PublicAPIClient[T any] struct {
	c       *http.Client
	base    string
	project string
}

func NewPublicAPIClient[T any](c *http.Client, base, project string) *PublicAPIClient[T] {
	if c == nil {
		c = http.DefaultClient
	}
	return &PublicAPIClient[T]{
		c:       c,
		base:    base,
		project: project,
	}
}

func (c *PublicAPIClient[T]) GetItems(ctx context.Context, model string) (_ []T, err error) {
	u, err := url.JoinPath(c.base, "api", "p", c.project, model)
	if err != nil {
		return
	}

	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return
	}

	res, err := c.c.Do(req)
	if err != nil {
		return
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
		return
	}

	var r publicAPIListResponse[T]
	if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
		return nil, err
	}

	return r.Results, nil
}

func (c *PublicAPIClient[T]) GetItem(ctx context.Context, model string, id string) (_ T, err error) {
	u, err := url.JoinPath(c.base, "api", "p", c.project, model, id)
	if err != nil {
		return
	}

	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return
	}

	res, err := c.c.Do(req)
	if err != nil {
		return
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
		return
	}

	var r T
	if err = json.NewDecoder(res.Body).Decode(&r); err != nil {
		return
	}

	return r, nil
}

func (c *PublicAPIClient[T]) GetAsset(ctx context.Context, id string) (*PublicAsset, error) {
	u, err := url.JoinPath(c.base, "api", "p", c.project, "assets", id)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return nil, err
	}

	res, err := c.c.Do(req)
	if err != nil {
		return nil, err
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
		return nil, err
	}

	var r PublicAsset
	if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
		return nil, err
	}

	return &r, nil
}

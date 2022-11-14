package cms

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

type Interface interface {
	Asset(ctx context.Context, id string) (*Asset, error)
	UploadAsset(ctx context.Context, url string) (string, error)
	UpdateItem(ctx context.Context, itemID string, fields map[string]any) error
	Comment(ctx context.Context, assetID, content string) error
}

type CMS struct {
	base   *url.URL
	token  string
	client *http.Client
}

func New(base, token string) (*CMS, error) {
	b, err := url.Parse(base)
	if err != nil {
		return nil, fmt.Errorf("failed to parse base url: %w", err)
	}

	return &CMS{
		base:   b,
		token:  token,
		client: http.DefaultClient,
	}, nil
}

func (c *CMS) UploadAsset(ctx context.Context, url string) (string, error) {
	rb := map[string]string{
		"url": url,
	}

	b, err := c.send(ctx, http.MethodPost, []string{"api", "assets"}, rb)
	if err != nil {
		return "", fmt.Errorf("failed to upload an asset: %w", err)
	}
	defer func() { _ = b.Close() }()

	body, err := io.ReadAll(b)
	if err != nil {
		return "", fmt.Errorf("failed to read body: %w", err)
	}

	var res map[string]string
	if err := json.Unmarshal(body, &res); err != nil {
		return "", fmt.Errorf("failed to parse body: %w", err)
	}

	if id, ok := res["id"]; !ok || id == "" {
		return "", fmt.Errorf("invalid body: %s", string(body))
	}

	return res["id"], nil
}

func (c *CMS) Asset(ctx context.Context, assetID string) (*Asset, error) {
	b, err := c.send(ctx, http.MethodGet, []string{"api", "assets", assetID}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get an asset: %w", err)
	}
	defer func() { _ = b.Close() }()

	a := &Asset{}
	if err := json.NewDecoder(b).Decode(a); err != nil {
		return nil, fmt.Errorf("failed to parse an asset: %w", err)
	}

	return a, nil
}

func (c *CMS) UpdateItem(ctx context.Context, itemID string, fields map[string]any) error {
	type F struct {
		ID    string `json:"id"`
		Value any    `json:"value"`
	}

	rb := map[string]any{
		"fields": lo.MapToSlice(fields, func(k string, v any) F {
			return F{
				ID:    k,
				Value: v,
			}
		}),
	}

	b, err := c.send(ctx, http.MethodPatch, []string{"api", "items", itemID}, rb)
	if err != nil {
		return fmt.Errorf("failed to update an item: %w", err)
	}
	defer func() { _ = b.Close() }()

	return nil
}

func (c *CMS) Comment(ctx context.Context, assetID, content string) error {
	rb := map[string]string{
		"content": content,
	}

	b, err := c.send(ctx, http.MethodPost, []string{"api", "threads", assetID, "comments"}, rb)
	if err != nil {
		return fmt.Errorf("failed to comment: %w", err)
	}
	defer func() { _ = b.Close() }()

	return nil
}

func (c *CMS) send(ctx context.Context, m string, p []string, body any) (io.ReadCloser, error) {
	req, err := c.request(ctx, m, p, body)
	if err != nil {
		return nil, err
	}

	log.Infof("CMS: request: %s %s body=%+v", req.Method, req.URL, body)

	res, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}

	if res.StatusCode != http.StatusOK {
		defer func() {
			_ = res.Body.Close()
		}()
		b, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read body: %w", err)
		}
		return nil, fmt.Errorf("failed to request: code=%d, body=%s", res.StatusCode, b)
	}

	return res.Body, nil
}

func (c *CMS) request(ctx context.Context, m string, p []string, body any) (*http.Request, error) {
	var b io.Reader
	if body != nil {
		bb, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal JSON: %w", err)
		}
		b = bytes.NewReader(bb)
	}

	req, err := http.NewRequestWithContext(ctx, m, c.base.JoinPath(p...).String(), b)
	if err != nil {
		return nil, fmt.Errorf("failed to init request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	return req, nil
}

type Asset struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

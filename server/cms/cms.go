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
	GetItem(ctx context.Context, itemID string) (*Item, error)
	CreateItem(ctx context.Context, modelID string, fields []Field) (*Item, error)
	UpdateItem(ctx context.Context, itemID string, fields []Field) (*Item, error)
	Asset(ctx context.Context, id string) (*Asset, error)
	UploadAsset(ctx context.Context, projectID, url string) (string, error)
	Comment(ctx context.Context, assetID, content string) error
}

type Field struct {
	ID    string `json:"id"`
	Type  string `json:"type"`
	Value any    `json:"value"`
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

func (c *CMS) GetItem(ctx context.Context, itemID string) (*Item, error) {
	b, err := c.send(ctx, http.MethodGet, []string{"api", "items", itemID}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get an item: %w", err)
	}
	defer func() { _ = b.Close() }()

	item := &Item{}
	if err := json.NewDecoder(b).Decode(&item); err != nil {
		return nil, fmt.Errorf("failed to parse an item: %w", err)
	}

	return item, nil
}

func (c *CMS) CreateItem(ctx context.Context, modelID string, fields []Field) (*Item, error) {
	rb := map[string]any{
		"fields": fields,
	}

	b, err := c.send(ctx, http.MethodPost, []string{"api", "models", modelID}, rb)
	if err != nil {
		return nil, fmt.Errorf("failed to create an item: %w", err)
	}
	defer func() { _ = b.Close() }()

	item := &Item{}
	if err := json.NewDecoder(b).Decode(&item); err != nil {
		return nil, fmt.Errorf("failed to parse an item: %w", err)
	}

	return item, nil
}

func (c *CMS) UpdateItem(ctx context.Context, itemID string, fields []Field) (*Item, error) {
	rb := map[string]any{
		"fields": fields,
	}

	b, err := c.send(ctx, http.MethodPatch, []string{"api", "items", itemID}, rb)
	if err != nil {
		return nil, fmt.Errorf("failed to update an item: %w", err)
	}
	defer func() { _ = b.Close() }()

	item := &Item{}
	if err := json.NewDecoder(b).Decode(&item); err != nil {
		return nil, fmt.Errorf("failed to parse an item: %w", err)
	}

	return item, nil
}

func (c *CMS) UploadAsset(ctx context.Context, projectID, url string) (string, error) {
	rb := map[string]string{
		"url": url,
	}

	b, err := c.send(ctx, http.MethodPost, []string{"api", "projects", projectID, "assets"}, rb)
	if err != nil {
		return "", fmt.Errorf("failed to upload an asset: %w", err)
	}
	defer func() { _ = b.Close() }()

	body, err := io.ReadAll(b)
	if err != nil {
		return "", fmt.Errorf("failed to read body: %w", err)
	}

	type res struct {
		ID string `json:"id"`
	}

	r := &res{}
	if err := json.Unmarshal(body, &r); err != nil {
		return "", fmt.Errorf("failed to parse body: %w", err)
	}

	return r.ID, nil
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

func (c *CMS) Comment(ctx context.Context, assetID, content string) error {
	rb := map[string]string{
		"content": content,
	}

	b, err := c.send(ctx, http.MethodPost, []string{"api", "assets", assetID, "comments"}, rb)
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

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	return req, nil
}

type Asset struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

type Item struct {
	ID     string  `json:"id"`
	Fields []Field `json:"fields"`
}

func (i Item) Field(id string) *Field {
	f, ok := lo.Find(i.Fields, func(f Field) bool { return f.ID == id })
	if ok {
		return &f
	}
	return nil
}

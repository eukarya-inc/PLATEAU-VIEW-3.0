package fme

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type Interface interface {
	CheckQuality(ctx context.Context, r Request) error
	ConvertAll(ctx context.Context, r Request) error
	CheckQualityAndConvertAll(ctx context.Context, r Request) error
}

type FME struct {
	base      *url.URL
	token     string
	resultURL string
	client    *http.Client
}

func New(baseUrl, token, resultURL string) (*FME, error) {
	b, err := url.Parse(baseUrl)
	if err != nil {
		return nil, fmt.Errorf("invalid base url: %w", err)
	}

	return &FME{
		base:      b,
		token:     token,
		resultURL: resultURL,
		client:    http.DefaultClient,
	}, nil
}

type Request struct {
	ID     string
	Target string
	// JGD2011平面直角座標第1～19系のEPSGコード（6669〜6687）
	PRCS string
}

func (s *FME) CheckQuality(ctx context.Context, r Request) error {
	return s.request(ctx, "plateau2022-cms/quality-check", r)
}

func (s *FME) ConvertAll(ctx context.Context, r Request) error {
	return s.request(ctx, "plateau2022-cms/convert-all", r)
}

func (s *FME) CheckQualityAndConvertAll(ctx context.Context, r Request) error {
	return s.request(ctx, "plateau2022-cms/quality-check-and-convert-all", r)
}

func (s *FME) request(ctx context.Context, w string, r Request) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.url(w, r), nil)
	if err != nil {
		return fmt.Errorf("failed to init request: %w", err)
	}

	if s.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("fmetoken token=%s", s.token))
	}

	res, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send: %w", err)
	}
	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode >= 300 {
		body, err := io.ReadAll(res.Body)
		if err != nil {
			return fmt.Errorf("failed to read body: %w", err)
		}

		return fmt.Errorf("failed to request: code=%d, body=%s", res.StatusCode, body)
	}

	return nil
}

func (s *FME) url(w string, r Request) string {
	u := s.base.JoinPath("fmejobsubmitter", w+".fmw")
	q := u.Query()
	q.Set("opt_servicemode", "async")
	q.Set("id", r.ID)
	q.Set("target", r.Target)
	q.Set("resultUrl", s.resultURL)
	if r.PRCS != "" {
		q.Set("prcs", r.PRCS)
	}
	u.RawQuery = q.Encode()
	return u.String()
}

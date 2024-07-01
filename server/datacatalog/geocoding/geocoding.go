// Package geocoding provides a client for accessing the Yahoo! Geocoder API.
// This package allows users to convert addresses into geographic coordinates (latitude and longitude) and retrieve bounding box information for given addresses.
// It leverages the Yahoo! Geocoder API to perform these geocoding tasks and parses the responses into usable structures.
// For more information on the Yahoo! Geocoder API, visit: https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/geocoder.html

package geocoding

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/JamesLMilner/quadtree-go"
)

const (
	endpoint = "https://map.yahooapis.jp/geocode/V1/geoCoder"
)

type Client struct {
	c     *http.Client
	appID string
}

func NewClient(appID string) *Client {
	return NewClientWith(appID, http.DefaultClient)
}

func NewClientWith(appID string, c *http.Client) *Client {
	return &Client{c: c, appID: appID}
}

func (c *Client) Bounds(ctx context.Context, address string) (quadtree.Bounds, error) {
	u, _ := url.ParseRequestURI(endpoint)
	params := url.Values{}
	params.Set("appId", c.appID)
	params.Set("output", "json")
	params.Set("query", address)
	u.RawQuery = params.Encode()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	res, err := c.c.Do(req)
	if err != nil {
		return quadtree.Bounds{}, fmt.Errorf("req: %w", err)
	}
	defer func() {
		_, _ = io.Copy(io.Discard, res.Body)
		_ = res.Body.Close()
	}()
	var body struct {
		Feature []struct {
			Geometry struct {
				BoundingBox string
			}
			Property struct {
				GovernmentCode string
			}
		}
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return quadtree.Bounds{}, fmt.Errorf("decode: %w", err)
	}
	for _, f := range body.Feature {
		if f.Geometry.BoundingBox == "" {
			continue
		}
		p1, p2, found := strings.Cut(f.Geometry.BoundingBox, " ")
		if !found {
			continue
		}
		lat1, lng1, err := parsePoint(p1)
		if err != nil {
			continue
		}
		lat2, lng2, err := parsePoint(p2)
		if err != nil {
			continue
		}
		return quadtree.Bounds{
			X:      lng1,
			Y:      lat1,
			Width:  lng2 - lng1,
			Height: lat2 - lat1,
		}, nil
	}
	return quadtree.Bounds{}, fmt.Errorf("not found")
}

func parsePoint(s string) (float64, float64, error) {
	lng, lat, found := strings.Cut(s, ",")
	if !found {
		return 0, 0, fmt.Errorf("invalid point")
	}
	x, err := strconv.ParseFloat(lng, 64)
	if err != nil {
		return 0, 0, fmt.Errorf("invalid lng: %w", err)
	}
	y, err := strconv.ParseFloat(lat, 64)
	if err != nil {
		return 0, 0, fmt.Errorf("invalid lat: %w", err)
	}
	return y, x, nil
}

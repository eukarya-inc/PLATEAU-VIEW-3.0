package citygml

import (
	"io"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/geo/spatialid"

	"github.com/orisano/gosax/xmlb"
)

type Reader interface {
	Open() (io.ReadCloser, error)
	Resolver() codeResolver
}

type urlReader struct {
	URL    string
	client *http.Client
}

func (r *urlReader) Open() (io.ReadCloser, error) {
	req, err := http.NewRequest(http.MethodGet, r.URL, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, resp.Body.Close()
	}
	return resp.Body, nil
}

func (r *urlReader) Resolver() codeResolver {
	return &fetchCodeResolver{
		client: r.client,
		url:    r.URL,
	}
}

func SpatialIDAttributes(rs []Reader, spatialIDs []string) ([]map[string]any, error) {
	var filter lod1SolidFilter
	for _, sid := range spatialIDs {
		b, err := spatialid.Bounds(sid)
		if err != nil {
			return nil, err
		}
		filter.Bounds = append(filter.Bounds, b)
	}

	var attributes []map[string]any
	buf := make([]byte, 32*1024)
	for _, r := range rs {
		err := func(r Reader) error {
			rc, err := r.Open()
			if err != nil {
				return err
			}
			defer rc.Close()
			fs := &featureScanner{
				Dec: xmlb.NewDecoder(rc, buf),
			}
			for fs.Scan() {
				id, el := fs.Feature()
				fah, err := newFeatureAttributeHandler(fs.ns, id, el, r.Resolver())
				if err != nil {
					return err
				}
				h := lod1SolidHandler{
					Next: fah,
				}
				if err := processFeature(fs.Dec, &h); err != nil {
					return err
				}
				if filter.IsIntersect(h.Faces) {
					attributes = append(attributes, fah.Val)
				}
			}
			if err := fs.Err(); err != nil {
				return err
			}
			return nil
		}(r)
		if err != nil {
			return nil, err
		}
	}
	return attributes, nil
}

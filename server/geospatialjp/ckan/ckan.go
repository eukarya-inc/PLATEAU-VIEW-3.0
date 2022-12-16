package ckan

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/reearth/reearthx/log"
)

type Ckan struct {
	base   *url.URL
	token  string
	client *http.Client
}

type Response[T any] struct {
	Help    string `json:"help,omitempty"`
	Success bool   `json:"success,omitempty"`
	Error   *Error `json:"error,omitempty"`
	Result  T      `json:"result,omitempty"`
}

type Error struct {
	Message string `json:"message,omitempty"`
	Type    string `json:"__type,omitempty"`
}

type Package struct {
	ID string `json:"id,omitempty"`
	// The name of the new dataset, must be between 2 and 100 characters long and
	// contain only lowercase alphanumeric characters, - and _, e.g. 'warandpeace'
	Name string `json:"name,omitempty"`
	// The title of the dataset (optional, default: same as name)
	Title string `json:"title,omitempty"`
	// If True creates a private dataset
	Private bool `json:"private,omitempty"`
	// The name of the dataset's author (optional)
	Author string `json:"author,omitempty"`
	// The email address of the dataset's author (optional)
	AuthorEmail string `json:"author_email,omitempty"`
	// The name of the dataset's maintainer (optional)
	Maintainer string `json:"maintainer,omitempty"`
	// The email address of the dataset's maintainer (optional)
	MaintainerEmail string `json:"maintainer_email,omitempty"`
	// The id of the dataset's license, see `~ckan.logic.action.get.license_list` for available values (optional)
	LicenseID string `json:"license_id,omitempty"`
	// A description of the dataset (optional)
	Notes string `json:"notes,omitempty"`
	// A URL for the dataset's source (optional)
	URL string `json:"url,omitempty"`
	// (optional)
	Version string `json:"version,omitempty"`
	// The current state of the dataset, e.g. 'active' or
	// 'deleted', only active datasets show up in search results and
	// other lists of datasets, this parameter will be ignored if you are not
	// authorized to change the state of the dataset (optional, default:
	// 'active')
	State string `json:"state,omitempty"`
	// The type of the dataset (optional),
	// `~ckan.plugins.interfaces.IDatasetForm` plugins
	// associate themselves with different dataset types and provide custom
	// dataset handling behaviour for these types
	Type string `json:"type,omitempty"`
	// The dataset's resources, see
	// `resource_create` for the format of resource dictionaries (optional)
	Resources []Resource `json:"resources,omitempty"`
	// The dataset's tags, see `tag_create` for the format
	// of tag dictionaries (optional)
	Tags []Tag `json:"tags,omitempty"`
	// The dataset's extras (optional), extras are arbitrary
	// (key: value) metadata items that can be added to datasets, each extra
	// dictionary should have keys 'key' (a string), 'value' (a string)
	Extras map[string]string `json:"extras,omitempty"`

	// relationships_as_object: See `package_relationship_create`
	// for the format of relationship dictionaries (optional)
	//  relationships_as_object: list of relationship dictionaries

	// relationships_as_subject: See `package_relationship_create`
	// for the format of relationship dictionaries (optional)
	//  relationships_as_subject: list of relationship dictionaries

	// groups: The groups to which the dataset belongs (optional), each
	// group dictionary should have one or more of the following keys which
	// identify an existing group:
	// 'id' (the id of the group, string), or 'name' (the name of the
	// group, string),  to see which groups exist
	// call `~ckan.logic.action.get.group_list`
	//  groups: list of dictionaries

	// The id of the dataset's owning organization, see
	// `~ckan.logic.action.get.organization_list` or
	// `~ckan.logic.action.get.organization_list_for_user` for
	// available values. This parameter can be made optional if the config
	// option `ckan.auth.create_unowned_dataset` is set to True.
	OwnerOrg string `json:"owner_org,omitempty"`
}

type Resource struct {
	ID string `json:"id,omitempty"`
	// id of package that the resource should be added to.
	PackageID string `json:"package_id,omitempty"`
	// url of resource
	URL              string `json:"url,omitempty"`
	RevisionID       string `json:"revision_id,omitempty"`
	Description      string `json:"description,omitempty"`
	Format           string `json:"format,omitempty"`
	Hash             string `json:"hash,omitempty"`
	Name             string `json:"name,omitempty"`
	ResourceType     string `json:"resource_type,omitempty"`
	Mimetype         string `json:"mimetype,omitempty"`
	MimetypeInner    string `json:"mimetype_inner,omitempty"`
	CacheUrl         string `json:"cache_url,omitempty"`
	Size             int    `json:"size,omitempty"`
	Created          string `json:"created,omitempty"`
	LastModified     string `json:"last_modified,omitempty"`
	CacheLastUpdated string `json:"cache_last_updated,omitempty"`
}

type Tag struct {
	ID           string `json:"id,omitempty"`
	Name         string `json:"name,omitempty"`
	DisplayName  string `json:"display_name,omitempty"`
	State        string `json:"state,omitempty"`
	VocabularyID string `json:"vocabulary_id,omitempty"`
}

func New(base, token string) (*Ckan, error) {
	b, err := url.Parse(base)
	if err != nil {
		return nil, err
	}
	return &Ckan{base: b, token: token, client: http.DefaultClient}, nil
}

func (c *Ckan) ShowPackage(ctx context.Context, id string) (Package, error) {
	res := Response[Package]{}
	err := c.send(ctx, "GET", []string{"api", "3", "action", "package_show"}, map[string]string{
		"id": id,
	}, nil, &res)
	if err != nil {
		return res.Result, fmt.Errorf("failed to get a package: %w", err)
	}

	return res.Result, nil
}

func (c *Ckan) CreatePackage(ctx context.Context, pkg Package) (Package, error) {
	res := Response[Package]{}

	b, err := json.Marshal(pkg)
	if err != nil {
		return res.Result, fmt.Errorf("failed to marshal: %w", err)
	}

	err = c.send(ctx, "POST", []string{"api", "3", "action", "package_create"}, nil, bytes.NewReader(b), &res)
	if err != nil {
		return res.Result, fmt.Errorf("failed to create a package: %w", err)
	}

	return res.Result, nil
}

func (c *Ckan) UpdatePackage(ctx context.Context, pkg Package) (Package, error) {
	res := Response[Package]{}

	b, err := json.Marshal(pkg)
	if err != nil {
		return res.Result, fmt.Errorf("failed to marshal: %w", err)
	}

	err = c.send(ctx, "POST", []string{"api", "3", "action", "package_update"}, nil, bytes.NewReader(b), &res)
	if err != nil {
		return res.Result, fmt.Errorf("failed to update a package: %w", err)
	}

	return res.Result, nil
}

func (c *Ckan) CreateResource(ctx context.Context, resource Resource) (Resource, error) {
	res := Response[Resource]{}

	b, err := json.Marshal(resource)
	if err != nil {
		return res.Result, fmt.Errorf("failed to marshal: %w", err)
	}

	err = c.send(ctx, "POST", []string{"api", "3", "action", "resource_create"}, nil, bytes.NewReader(b), &res)
	if err != nil {
		return res.Result, fmt.Errorf("failed to create a resource: %w", err)
	}

	return res.Result, nil
}

func (c *Ckan) UpdateResource(ctx context.Context, resource Resource) (Resource, error) {
	res := Response[Resource]{}

	b, err := json.Marshal(resource)
	if err != nil {
		return res.Result, fmt.Errorf("failed to marshal: %w", err)
	}

	err = c.send(ctx, "POST", []string{"api", "3", "action", "resource_update"}, nil, bytes.NewReader(b), &res)
	if err != nil {
		return res.Result, fmt.Errorf("failed to update a resource: %w", err)
	}

	return res.Result, nil
}

func (c *Ckan) send(ctx context.Context, method string, path []string, queries map[string]string, body io.Reader, result any) error {
	u := c.base.JoinPath(path...)
	if queries != nil {
		q := u.Query()
		for k, v := range queries {
			q.Set(k, v)
		}
		u.RawQuery = q.Encode()
	}

	req, err := http.NewRequestWithContext(ctx, method, u.String(), body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if c.token != "" {
		req.Header.Set("X-CKAN-API-Key", c.token)
	}
	log.Infof("ckan: send: %s %s", method, u)

	res, err := c.client.Do(req)
	if err != nil {
		log.Errorf("ckan: send error: %s", err)
		return fmt.Errorf("failed to send request: %w", err)
	}

	defer func() { _ = res.Body.Close() }()

	if res.StatusCode != 200 {
		body, _ := io.ReadAll(req.Body)
		log.Infof("ckan: result (%d): %s", res.StatusCode, body)
		return fmt.Errorf("status code %d: %s", res.StatusCode, body)
	}

	b, err := io.ReadAll(res.Body)
	if err != nil {
		log.Errorf("ckan: result (%d): failed to read response body")
		return fmt.Errorf("failed to read response body: %w", err)
	}

	log.Infof("ckan: ok: %s", b)

	if result != nil {
		if err := json.Unmarshal(b, result); err != nil {
			return fmt.Errorf("failed to parse JSON: %w", err)
		}
	}

	return nil
}

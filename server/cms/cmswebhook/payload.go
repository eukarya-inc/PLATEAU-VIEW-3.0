package cmswebhook

import "github.com/eukarya-inc/reearth-plateauview/server/cms"

type Payload struct {
	Type     string   `json:"type"`
	Data     Data     `json:"data"`
	Operator Operator `json:"operator"`
}

type Operator struct {
	User        *User        `json:"user,omitempty"`
	Integration *Integration `json:"integration,omitempty"`
	Machine     *Machine     `json:"machine,omitempty"`
}

func (o Operator) IsUser() bool {
	return o.User != nil
}

func (o Operator) IsIntegration() bool {
	return o.Integration != nil
}

type User struct {
	ID string `json:"id"`
}

type Integration struct {
	ID string `json:"id"`
}

type Machine struct{}

type Data struct {
	Item   *cms.Item   `json:"item"`
	Model  *cms.Model  `json:"model"`
	Schema *cms.Schema `json:"schema"`
}

func (d Data) FieldByKey(key string) *cms.Field {
	return d.Item.FieldByKey2(key, d.Schema)
}

package plateauv2

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDir(t *testing.T) {
	d := Dic{
		"admin": []DicEntry{
			{
				Code:        "11111",
				Description: "A県 A市",
			},
		},
		"fld": []DicEntry{
			{
				Name:        "aaa",
				Admin:       "都道府県",
				Description: "xxx",
			},
			{
				Name:        "aaa",
				Admin:       "国",
				Description: "xxx",
			},
		},
		"htd": []DicEntry{
			{
				Name:        "bbb",
				Description: "xxx",
			},
		},
		"tnm": []DicEntry{
			{
				Name:        "ccc",
				Description: "xxx",
			},
		},
		"ifld": []DicEntry{
			{
				Name:        "ddd",
				Description: "xxx",
			},
		},
	}

	assert.Equal(t, "A市", d.WardName("11111"))
	assert.Empty(t, d.WardName("11110"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "aaa",
		Description: "xxx",
		Admin:       "都道府県",
		Scale:       "",
	}, d.Fld("aaa", "aedrqe"))
	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "aaa",
		Description: "xxx",
		Admin:       "国",
		Scale:       "",
	}, d.Fld("aaa", "natl"))
	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "aaa",
		Description: "xxx",
		Admin:       "都道府県",
		Scale:       "",
	}, d.Fld("aaa", "pref"))
	assert.Nil(t, d.Fld("bbb", ""))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "bbb",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.FindByName("htd", "bbb"))
	assert.Nil(t, d.FindByName("htd", "aaa"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "ccc",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.FindByName("tnm", "ccc"))
	assert.Nil(t, d.FindByName("tnm", "aaa"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "ddd",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.FindByName("ifld", "ddd"))
	assert.Nil(t, d.FindByName("ifld", "aaa"))
}

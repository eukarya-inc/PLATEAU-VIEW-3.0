package datacatalog

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDir(t *testing.T) {
	d := Dic{
		"admin": []DicEntry{
			{
				Code: "11111",
				Name: "A県 A市",
			},
		},
		"fld": []DicEntry{
			{
				Name:        "aaa",
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
		Admin:       "",
		Scale:       "",
	}, d.Fld("aaa"))
	assert.Nil(t, d.Fld("bbb"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "bbb",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.Htd("bbb"))
	assert.Nil(t, d.Htd("aaa"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "ccc",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.Tnm("ccc"))
	assert.Nil(t, d.Tnm("aaa"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "ddd",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.Ifld("ddd"))
	assert.Nil(t, d.Ifld("aaa"))
}

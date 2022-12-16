package geospatialjp

// const fileName = "xxx_xxx_catalog.xlsx"

// func TestCatalogFile(t *testing.T) {
// 	f, err := os.Open("testdata/" + fileName)
// 	if err != nil {
// 		t.SkipNow()
// 		return
// 	}

// 	assert.NoError(t, err)
// 	defer f.Close()

// 	xf, err := excelize.OpenReader(f)
// 	assert.NoError(t, err)

// 	c := NewCatalogueFile(xf)

// 	picFileName, picRaw, err := xf.GetPicture("G空間登録用メタデータ ", "D22")
// 	assert.NoError(t, err)

// 	cc, err := c.Parse()
// 	assert.NoError(t, err)
// 	assert.Equal(t, Catalogue{
// 		Thumbnail:         picRaw,
// 		ThumbnailFileName: picFileName,
// 	}, cc)

// 	assert.Equal(t, "B2", util.DR(c.findCell("G空間登録用メタデータ ", "タイトル", nil)))
// }

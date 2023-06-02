package plateauv2

import (
	"path"
	"strconv"
	"strings"

	"github.com/reearth/reearthx/util"
)

type Description struct {
	Override Override
	Desc     string
}

func descFromAsset(an AssetName, descs []string, single bool) Description {
	if single && len(descs) > 0 {
		return DescriptionFrom(descs[0])
	}

	if len(descs) == 0 {
		return Description{}
	}

	assetName := an.String()
	fn := strings.TrimSuffix(assetName, path.Ext(assetName))
	for _, desc := range descs {
		b, a, ok := strings.Cut(desc, "\n")
		if ok && strings.Contains(b, fn) {
			return DescriptionFrom(a)
		}
	}

	return Description{}
}

func DescriptionFrom(d string) Description {
	tags, rest := extractTags(strings.TrimSpace(d))

	var orderr *int
	order, _ := strconv.Atoi(tags["order"])
	if order > 0 {
		orderr = &order
	}

	return Description{
		Override: Override{
			Name:     tags["name"],
			SubName:  tags["subname"],
			Type:     tags["type"],
			TypeEn:   tags["type_en"],
			Type2:    tags["type2"],
			Type2En:  tags["type2_en"],
			Area:     tags["area"],
			ItemName: tags["item_name"],
			Layers:   multipleValues(tags["layer"]),
			Root:     tags["root"] == "true",
			Order:    orderr,
		},
		Desc: rest,
	}
}

func extractTags(s string) (map[string]string, string) {
	s = strings.TrimSpace(s)
	lines := strings.Split(s, "\n")
	tags := map[string]string{}

	last := -1
	for i, l := range lines {
		if l != "" && !strings.HasPrefix(l, "@") {
			break
		}

		if l == "" {
			last = i
			continue
		}

		l = strings.TrimSpace(strings.TrimPrefix(l, "@"))
		k, v, found := strings.Cut(l, ":")
		if !found {
			break
		}

		tags[k] = strings.TrimSpace(v)
		last = i
	}

	if last == -1 {
		return tags, s
	}

	rest := strings.TrimSpace(strings.Join(lines[last+1:], "\n"))
	return tags, rest
}

func multipleValues(v string) []string {
	vv := strings.Split(v, ",")
	if len(vv) == 0 || len(vv) == 1 && vv[0] == "" {
		return nil
	}
	return util.Map(vv, strings.TrimSpace)
}

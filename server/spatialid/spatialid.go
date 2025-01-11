// Package spatialid provides functionality to work with spatial IDs and convert
// them to geographic bounds. It includes functions to parse spatial IDs in different
// formats and calculate their geographic bounds.

package spatialid

import (
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/JamesLMilner/quadtree-go"
	"github.com/eukarya-inc/reearth-plateauview/server/geo"
)

// zfxyTile represents a tile with zoomed level (z), floor (f), x-coordinate (x),
// and y-coordinate (y)
type zfxyTile struct {
	z int
	f int
	x int
	y int
}

// Bounds calculates the geographic bounds of the tile. It returns the bounds
// as a quadtree.Bounds object which includes the longitude and latitude of the
// tile's bottom-left corner, and its width and height in degrees.
func (t *zfxyTile) Bounds() quadtree.Bounds {
	z := zoom(t.z)
	lngMin := z.lng(t.x)
	lngMax := z.lng(t.x + 1)
	latMin, latMax := minmax(z.lat(t.y), z.lat(t.y+1))
	return quadtree.Bounds{
		X:      lngMin,
		Y:      latMin,
		Width:  lngMax - lngMin,
		Height: latMax - latMin,
	}
}

func (t *zfxyTile) Bounds3() geo.Bounds3 {
	z := zoom(t.z)
	lngMin := z.lng(t.x)
	lngMax := z.lng(t.x + 1)
	latMin, latMax := minmax(z.lat(t.y), z.lat(t.y+1))
	floorMin := z.floor(t.f)
	floorMax := z.floor(t.f + 1)
	return geo.Bounds3{
		Min: geo.Point3{
			X: lngMin,
			Y: latMin,
			Z: floorMin,
		},
		Max: geo.Point3{
			X: lngMax,
			Y: latMax,
			Z: floorMax,
		},
	}
}

func minmax(a, b float64) (float64, float64) {
	if a < b {
		return a, b
	} else {
		return b, a
	}
}

func zoom(level int) zoomed {
	return zoomed{
		level: level,
		v:     1 / float64(int(1)<<level),
	}
}

type zoomed struct {
	level int
	v     float64
}

func (z zoomed) lng(x int) float64 {
	return float64(x)*z.v*360.0 - 180.0
}

func (z zoomed) lat(y int) float64 {
	t := math.Pi - 2.0*math.Pi*float64(y)*z.v
	return (180.0 / math.Pi) * math.Atan(math.Sinh(t))
}

func (z zoomed) floor(f int) float64 {
	return float64(f) * float64(int64(1<<(25-z.level)))
}

// Bounds parses the given string as a tile identifier and returns the geographic
// bounds of the tile. The input can be in the format "/z/x/y" or "/z/f/x/y", or
// as a hash string. It returns an error if the format is invalid or the string
// contains invalid characters.
func Bounds(s string) (quadtree.Bounds, error) {
	if strings.HasPrefix(s, "/") {
		t, err := parseTile(s)
		if err != nil {
			return quadtree.Bounds{}, err
		}
		return t.Bounds(), nil
	} else {
		t, err := parseTileHash(s)
		if err != nil {
			return quadtree.Bounds{}, err
		}
		return t.Bounds(), nil
	}
}

func Bounds3(s string) (geo.Bounds3, error) {
	if strings.HasPrefix(s, "/") {
		t, err := parseTile(s)
		if err != nil {
			return geo.Bounds3{}, err
		}
		return t.Bounds3(), nil
	} else {
		t, err := parseTileHash(s)
		if err != nil {
			return geo.Bounds3{}, err
		}
		return t.Bounds3(), nil
	}
}

// parseTile parses a tile identifier in the format "/z/x/y" or "/z/f/x/y". It
// returns a zfxyTile object or an error if the format is invalid.
func parseTile(s string) (zfxyTile, error) {
	// /z/f?/x/y
	tokens := strings.SplitN(s, "/", 6)
	switch len(tokens) {
	case 4:
		var t zfxyTile
		var err error
		if t.z, err = strconv.Atoi(tokens[1]); err != nil {
			return zfxyTile{}, err
		}
		if t.x, err = strconv.Atoi(tokens[2]); err != nil {
			return zfxyTile{}, err
		}
		if t.y, err = strconv.Atoi(tokens[3]); err != nil {
			return zfxyTile{}, err
		}
		return t, nil
	case 5:
		var t zfxyTile
		var err error
		if t.z, err = strconv.Atoi(tokens[1]); err != nil {
			return zfxyTile{}, err
		}
		if t.f, err = strconv.Atoi(tokens[2]); err != nil {
			return zfxyTile{}, err
		}
		if t.x, err = strconv.Atoi(tokens[3]); err != nil {
			return zfxyTile{}, err
		}
		if t.y, err = strconv.Atoi(tokens[4]); err != nil {
			return zfxyTile{}, err
		}
		return t, nil
	default:
		return zfxyTile{}, fmt.Errorf("invalid format")
	}
}

// parseTileHash parses a hash string representing a tile and converts it into a
// zfxyTile object. The hash string is a sequence of characters '1' to '9'
// representing the tile's coordinates. It returns an error if the string
// contains invalid characters.
func parseTileHash(s string) (zfxyTile, error) {
	var f, y, x int
	for _, c := range s {
		if !('1' <= c && c <= '9') {
			return zfxyTile{}, fmt.Errorf("invalid character '%c'", c)
		}
		v := c - '1'
		x <<= 1
		y <<= 1
		f <<= 1
		if v&1 != 0 {
			x |= 1
		}
		if v&2 != 0 {
			y |= 1
		}
		if v&4 != 0 {
			f |= 1
		}
	}
	z := len(s)
	return zfxyTile{z: z, f: f, x: x, y: y}, nil
}

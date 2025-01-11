package geo

type Vec3 struct {
	X, Y, Z float64
}
type Point3 Vec3
type Bounds3 struct {
	Min, Max Point3
}

func (b Bounds3) IsIntersect(b2 Bounds3) bool {
	return b.Min.X <= b2.Max.X && b.Max.X >= b2.Min.X &&
		b.Min.Y <= b2.Max.Y && b.Max.Y >= b2.Min.Y &&
		b.Min.Z <= b2.Max.Z && b.Max.Z >= b2.Min.Z
}

type Polygon3 []Point3

type Polyhedron []Polygon3

func (po Polyhedron) Bounds() Bounds3 {
	mini := po[0][0]
	maxi := po[0][0]
	for _, p := range po {
		for _, p2 := range p {
			mini.X = min(mini.X, p2.X)
			mini.Y = min(mini.Y, p2.Y)
			mini.Z = min(mini.Z, p2.Z)
			maxi.X = max(maxi.X, p2.X)
			maxi.Y = max(maxi.Y, p2.Y)
			maxi.Z = max(maxi.Z, p2.Z)
		}
	}
	return Bounds3{mini, maxi}
}

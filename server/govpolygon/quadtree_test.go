package govpolygon

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestQuadtree(t *testing.T) {
	p := NewProcessor()
	q, _, err := p.ComputeGeoJSON(nil)
	assert.NoError(t, err)

	res, ok := q.Find(139.760296, 35.686067)
	assert.True(t, ok)
	assert.Equal(t, "13101", res)

	res, ok = q.Find(19.760296, 35.686067)
	assert.False(t, ok)
	assert.Empty(t, res)
}

func BenchmarkQuadtree(b *testing.B) {
	p := NewProcessor()
	q, _, _ := p.ComputeGeoJSON(nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = q.Find(139.760296, 35.686067)
	}
}

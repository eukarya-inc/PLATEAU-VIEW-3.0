package geospatialjp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCellPos(t *testing.T) {
	c, err := ParseCellPos("XZ112")
	assert.NoError(t, err)
	assert.Equal(t, CellPos{x: "XZ", y: 112}, c)
	assert.Equal(t, "XZ112", c.String())

	assert.Equal(t, CellPos{y: 2}, CellPos{y: 1}.ShiftY(1))
	assert.Equal(t, CellPos{x: "B"}, CellPos{x: "A"}.ShiftX(1))
	assert.Equal(t, CellPos{x: "AA"}, CellPos{x: "Z"}.ShiftX(1))  // 25 -> 26
	assert.Equal(t, CellPos{x: "BA"}, CellPos{x: "AZ"}.ShiftX(1)) // 51 -> 52
	assert.Equal(t, CellPos{x: "AAA"}, CellPos{x: "ZZ"}.ShiftX(1))
	assert.Equal(t, CellPos{x: "Z"}, CellPos{x: "AB"}.ShiftX(-2))
	assert.Equal(t, CellPos{x: "ZZ"}, CellPos{x: "AAB"}.ShiftX(-2))
	assert.Equal(t, CellPos{x: "A"}, CellPos{x: "A"}.ShiftX(-1))
	assert.Equal(t, CellPos{x: "A"}, CellPos{x: "A"}.ShiftX(-30))
}

func TestXCode(t *testing.T) {
	assert.Equal(t, 0, xCode("A"))
	assert.Equal(t, 1, xCode("B"))
	assert.Equal(t, 25, xCode("Z"))
	assert.Equal(t, 26, xCode("AA"))
	assert.Equal(t, 51, xCode("AZ"))
	assert.Equal(t, 52, xCode("BA"))
	assert.Equal(t, 78, xCode("CA"))
	assert.Equal(t, 701, xCode("ZZ"))
	assert.Equal(t, 702, xCode("AAA"))
	assert.Equal(t, 728, xCode("ABA"))

	assert.Equal(t, "A", fromXCode(0))
	assert.Equal(t, "B", fromXCode(1))
	assert.Equal(t, "Z", fromXCode(25))
	assert.Equal(t, "AA", fromXCode(26))
	assert.Equal(t, "AZ", fromXCode(51))
	assert.Equal(t, "BA", fromXCode(52))
	assert.Equal(t, "CA", fromXCode(78))
	assert.Equal(t, "ZZ", fromXCode(701))
	assert.Equal(t, "AAA", fromXCode(702))
	assert.Equal(t, "ABA", fromXCode(728))
}

package cms

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParallel(t *testing.T) {
	res, err := parallel(2, func(p int) (int, int, error) {
		return p + 1, 6, nil
	})
	assert.NoError(t, err)
	assert.Equal(t, []int{1, 2, 3, 4, 5, 6}, res)

	expectedErr := errors.New("ERROR")
	res, err = parallel(2, func(p int) (int, int, error) {
		if p == 3 {
			return 0, 0, expectedErr
		}
		return p + 1, 6, nil
	})
	assert.Same(t, expectedErr, err)
	assert.Nil(t, res)
}

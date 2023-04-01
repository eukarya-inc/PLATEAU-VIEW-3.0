package putil

import (
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestKeyLock(t *testing.T) {
	k := NewKeyLock[string]()
	m := []string{}
	wg := &sync.WaitGroup{}
	wg.Add(2)
	k.Lock("1")

	go func() {
		k.Lock("1")
		defer k.Unlock("1")
		m = append(m, "a")
		wg.Done()
	}()

	go func() {
		k.Lock("2")
		defer k.Unlock("2")
		m = append(m, "c")
		k.Unlock("1")
		wg.Done()
	}()

	m = append(m, "b")
	wg.Wait()

	assert.Equal(t, []string{"b", "c", "a"}, m)
}

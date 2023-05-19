package cms

func parallel[T any](limit int, fn func(int) (T, int, error)) ([]T, error) {
	r, maxPage, err := fn(0)
	if err != nil {
		return nil, err
	}

	res := make([]T, maxPage)
	res[0] = r

	type result struct {
		Page int
		Res  T
		Err  error
	}

	guard := make(chan struct{}, limit)
	results := make(chan result, maxPage)

	for i := 1; i < maxPage; i++ {
		go func(i int) {
			guard <- struct{}{}
			defer func() { <-guard }()

			r, _, err := fn(i)
			results <- result{Page: i, Res: r, Err: err}
		}(i)
	}

	for i := 1; i < maxPage; i++ {
		r := <-results
		if r.Err != nil {
			return nil, r.Err
		}

		res[r.Page] = r.Res
	}

	return res, nil
}

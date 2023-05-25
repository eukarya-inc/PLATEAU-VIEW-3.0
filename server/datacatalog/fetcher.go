package datacatalog

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"path"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/cms"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const timeoutSecond int64 = 20
const ModelPlateau = "plateau"
const ModelUsecase = "usecase"
const ModelDataset = "dataset"

type Fetcher struct {
	cmsp *cms.PublicAPIClient[PlateauItem]
	cmsu *cms.PublicAPIClient[UsecaseItem]
	base *url.URL
}

func NewFetcher(c *http.Client, cmsbase string) (*Fetcher, error) {
	u, err := url.Parse(cmsbase)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "api", "p")

	cmsp, err := cms.NewPublicAPIClient[PlateauItem](c, cmsbase)
	if err != nil {
		return nil, err
	}

	cmsp = cmsp.WithTimeout(time.Duration(timeoutSecond) * time.Second)

	return &Fetcher{
		cmsp: cmsp,
		cmsu: cms.ChangePublicAPIClientType[PlateauItem, UsecaseItem](cmsp),
		base: u,
	}, nil
}

func (f *Fetcher) Clone() *Fetcher {
	if f == nil {
		return nil
	}

	return &Fetcher{
		cmsp: f.cmsp.Clone(),
		cmsu: f.cmsu.Clone(),
		base: util.CloneRef(f.base),
	}
}

func (f *Fetcher) Do(ctx context.Context, project string) (ResponseAll, error) {
	f1, f2, f3 := f.Clone(), f.Clone(), f.Clone()

	res1 := lo.Async2(func() ([]PlateauItem, error) {
		return f1.plateau(ctx, project, ModelPlateau)
	})
	res2 := lo.Async2(func() ([]UsecaseItem, error) {
		return f2.usecase(ctx, project, ModelUsecase)
	})
	res3 := lo.Async2(func() ([]UsecaseItem, error) {
		return f3.usecase(ctx, project, ModelDataset)
	})

	notFound := 0
	r := ResponseAll{}

	if res := <-res1; res.B != nil {
		if errors.Is(res.B, rerror.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Plateau = append(r.Plateau, res.A...)
	}

	if res := <-res2; res.B != nil {
		if errors.Is(res.B, rerror.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Usecase = append(r.Usecase, res.A...)
	}

	if res := <-res3; res.B != nil {
		if errors.Is(res.B, rerror.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Usecase = append(r.Usecase, res.A...)
	}

	if notFound == 3 {
		return r, rerror.ErrNotFound
	}
	return r, nil
}

func (f *Fetcher) plateau(ctx context.Context, project, model string) (resp []PlateauItem, err error) {
	r, err := f.cmsp.GetAllItemsInParallel(ctx, project, model, 10)
	if err != nil {
		return
	}
	return r, nil
}

func (f *Fetcher) usecase(ctx context.Context, project, model string) (resp []UsecaseItem, err error) {
	r, err := f.cmsu.GetAllItemsInParallel(ctx, project, model, 10)
	if err != nil {
		return
	}

	if model == ModelUsecase {
		for i := range r {
			r[i].Type = "ユースケース"
		}
	}

	return r, nil
}

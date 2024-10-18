package datacatalogv3

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
)

func AdminContext(ctx context.Context, bypassAdminRemoval, includeBeta, includeAlpha bool) context.Context {
	if bypassAdminRemoval {
		ctx = plateauapi.BypassAdminRemoval(ctx, true)
	}
	var stages []string
	if includeBeta {
		stages = append(stages, string(stageBeta))
	}
	if includeAlpha {
		stages = append(stages, string(stageAlpha))
	}
	if len(stages) > 0 {
		ctx = plateauapi.AllowAdminStages(ctx, stages)
	}
	return ctx
}

type Repos struct {
	pcms  plateaucms.SpecStore
	cms   *util.SyncMap[string, *CMS]
	cache bool
	*plateauapi.Repos
}

func NewRepos(pcms plateaucms.SpecStore) *Repos {
	r := &Repos{
		pcms: pcms,
		cms:  util.NewSyncMap[string, *CMS](),
	}
	r.Repos = plateauapi.NewRepos(r.update)
	return r
}

func (r *Repos) EnableCache(cache bool) {
	r.cache = cache
}

func (r *Repos) Prepare(ctx context.Context, project string, year int, plateau bool, cms cms.Interface) error {
	if _, ok := r.cms.Load(project); ok {
		return nil
	}

	r.setCMS(project, year, plateau, cms)
	_, err := r.Update(ctx, project)
	return err
}

func (r *Repos) update(ctx context.Context, project string) (*plateauapi.ReposUpdateResult, error) {
	cms, ok := r.cms.Load(project)
	if !ok {
		return nil, fmt.Errorf("cms is not initialized for %s", project)
	}

	updated := r.UpdatedAt(project)
	var updatedStr string
	if !updated.IsZero() {
		updatedStr = updated.Format(time.RFC3339)
	}
	log.Debugfc(ctx, "datacatalogv3: updating repo %s: last_update=%s", project, updatedStr)

	data, err := cms.GetAll(ctx, project)
	if err != nil {
		return nil, err
	}

	c, warning := data.Into()
	sort.Strings(warning)
	repo := plateauapi.NewInMemoryRepo(c)

	log.Debugfc(ctx, "datacatalogv3: updated repo %s", project)

	return &plateauapi.ReposUpdateResult{
		Repo:     repo,
		Warnings: warning,
	}, nil
}

func (r *Repos) setCMS(project string, year int, plateau bool, cms cms.Interface) {
	c := NewCMS(cms, r.pcms, year, plateau, project, r.cache)
	r.cms.Store(project, c)
}

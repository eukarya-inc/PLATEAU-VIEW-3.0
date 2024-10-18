package plateaucms

import (
	"context"

	cms "github.com/reearth/reearth-cms-api/go"
)

type plateauCMSContextKey struct{}
type cmsContextKey struct{}
type cmsMetadataContextKey struct{}
type cmsAllMetadataContextKey struct{}

func GetPlateauCMSFromContext(ctx context.Context) *CMS {
	cms, _ := ctx.Value(plateauCMSContextKey{}).(*CMS)
	return cms
}

func SetPlateauCMSToContext(ctx context.Context, c *CMS) context.Context {
	return context.WithValue(ctx, plateauCMSContextKey{}, c)
}

func GetCMSFromContext(ctx context.Context) cms.Interface {
	cms, _ := ctx.Value(cmsContextKey{}).(cms.Interface)
	return cms
}

func GetCMSMetadataFromContext(ctx context.Context) Metadata {
	md, _ := ctx.Value(cmsMetadataContextKey{}).(Metadata)
	return md
}

func GetAllCMSMetadataFromContext(ctx context.Context) MetadataList {
	md, _ := ctx.Value(cmsAllMetadataContextKey{}).(MetadataList)
	return md
}

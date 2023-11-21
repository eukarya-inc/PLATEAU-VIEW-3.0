import { useAtomValue, useSetAtom } from "jotai";
import { intersectionBy, uniqBy } from "lodash-es";
import { useMemo, type FC } from "react";

import { makePropertyForFeatureInspector } from "../../../shared/plateau/featureInspector";
import { TILESET_FEATURE } from "../../../shared/reearth/layers";
import { Feature } from "../../../shared/reearth/types/layer";
import { findRootLayerAtom, rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { RootLayer } from "../../../shared/view-layers";
import { LayerModel, useFindLayer } from "../../layers";
import { ParameterList, PropertyParameterItem } from "../../ui-components";
import { type SCREEN_SPACE_SELECTION, type SelectionGroup } from "../states/selection";

export interface TileFeaturePropertiesSectionProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof TILESET_FEATURE;
  })["values"];
}

export const TileFeaturePropertiesSection: FC<TileFeaturePropertiesSectionProps> = ({ values }) => {
  const findRootLayer = useSetAtom(findRootLayerAtom);
  const rootLayersLayers = useAtomValue(rootLayersLayersAtom);
  const findLayer = useFindLayer();

  const layers = useMemo(() => {
    const layersMap = values.reduce((res, v) => {
      if (!res[v.layerId]) {
        res[v.layerId] = [];
      }
      res[v.layerId].push(v.key);
      return res;
    }, {} as { [layerId: string]: string[] });
    return Object.keys(layersMap).reduce((res, layerId) => {
      const featureIds = layersMap[layerId];
      const fs = uniqBy(
        window.reearth?.layers?.findFeaturesByIds?.(layerId, featureIds) ?? [],
        "id",
      );

      const rootLayer = findRootLayer(layerId);
      const layer = findLayer(rootLayersLayers, (l, get) => get(l.layerIdAtom) === layerId);

      return res.concat({ features: fs ?? [], layer, rootLayer });
    }, [] as { features: Pick<Feature, "properties">[]; layer?: LayerModel; rootLayer: RootLayer | undefined }[]);
  }, [values, findLayer, findRootLayer, rootLayersLayers]);

  const properties = useMemo(() => {
    // TODO: Replace properties by JSONPath
    const properties = layers.reduce((res, { features, rootLayer, layer }) => {
      return res.concat(
        ...makePropertyForFeatureInspector({
          features,
          layer,
          featureInspector: rootLayer?.featureInspector,
        }),
      );
    }, [] as Feature["properties"][]);

    return intersectionBy(properties, "name");
  }, [layers]);

  return (
    <ParameterList>
      <PropertyParameterItem properties={properties} />
    </ParameterList>
  );
};

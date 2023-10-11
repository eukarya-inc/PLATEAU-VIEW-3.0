import { intersection } from "lodash";
import { useMemo, type FC } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import { ParameterList, PropertyParameterItem } from "../../../prototypes/ui-components";
import {
  type SCREEN_SPACE_SELECTION,
  type SelectionGroup,
} from "../../../prototypes/view/states/selection";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Feature } from "../../reearth/types/layer";

export interface GeneralFeaturePropertiesSectionProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof GENERAL_FEATURE;
  })["values"];
}

const excludedPropertyNames = ["LOD1立ち上げに使用する高さ"];

// TODO(reearth): Support CZML description HTML
export const GeneralFeaturePropertiesSection: FC<GeneralFeaturePropertiesSectionProps> = ({
  values,
}) => {
  const features = useMemo(() => {
    const layersMap = values.reduce((res, v) => {
      if (!res[v.layerId]) {
        res[v.layerId] = [];
      }
      res[v.layerId].push(v.key);
      return res;
    }, {} as { [layerId: string]: string[] });
    return Object.keys(layersMap).reduce((res, layerId) => {
      const featureIds = layersMap[layerId];
      const fs = window.reearth?.layers?.findFeaturesByIds?.(layerId, featureIds);
      return res.concat(fs ?? []);
    }, [] as Feature[]);
  }, [values]);

  const properties = useMemo(
    () =>
      intersection(...features.map(feature => Object.keys(feature.properties ?? {})))
        .filter(name => !name.startsWith("_") && !excludedPropertyNames.includes(name))
        .map(name => ({
          name,
          values: features.map(feature => feature.properties[name]).filter(isNotNullish),
        }))
        .filter(({ values }) => {
          if (values.length === 0) {
            return false;
          }
          const type = typeof values[0];
          if (type !== "string" && type !== "number" && type !== "object") {
            return false;
          }
          return (
            values.length === features.length &&
            // eslint-disable-next-line valid-typeof
            values.slice(1).every(value => typeof value === type)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [features],
  );

  return (
    <ParameterList>
      <PropertyParameterItem properties={properties} />
    </ParameterList>
  );
};

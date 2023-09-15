import { intersection } from "lodash";
import { useMemo, type FC } from "react";

import { TILESET_FEATURE } from "../../../shared/reearth/layers";
import { isNotNullish } from "../../type-helpers";
import { ParameterList, PropertyParameterItem } from "../../ui-components";
import { type SCREEN_SPACE_SELECTION, type SelectionGroup } from "../states/selection";

export interface TileFeaturePropertiesSectionProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof TILESET_FEATURE;
  })["values"];
}

const excludedPropertyNames = ["LOD1立ち上げに使用する高さ"];

export const TileFeaturePropertiesSection: FC<TileFeaturePropertiesSectionProps> = ({ values }) => {
  const featureIds = useMemo(() => values.filter(isNotNullish), [values]);

  const features = useMemo(() => {
    // TODO: Support selecting multiple features
    const selectedFeature = window.reearth?.layers?.selectedFeature;
    if (selectedFeature?.id === featureIds[0].key) {
      return [selectedFeature];
    }
    return [];
  }, [featureIds]);

  const properties = useMemo(
    () =>
      intersection(...features.map(feature => Object.keys(feature.properties)))
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

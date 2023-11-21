import { intersection } from "lodash-es";

import { LayerModel } from "../../../prototypes/layers";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { datasetTypeNames } from "../../../prototypes/view/constants/datasetTypeNames";
import { PlateauDatasetType } from "../../../prototypes/view/constants/plateau";
import { Feature } from "../../reearth/types/layer";
import { FLOOD_LAYER_TYPES, RootLayer } from "../../view-layers";

import { getAttributes, getRootFields } from "./attributes";

export const makePropertyForFeatureInspector = ({
  features,
  featureInspector,
  layer,
}: {
  featureInspector: RootLayer["featureInspector"];
  layer: LayerModel | undefined;
  features: Pick<Feature, "properties">[];
}) => {
  const rawRootProperties = features
    .map(f =>
      getRootFields(
        f.properties,
        layer?.type,
        (FLOOD_LAYER_TYPES as string[]).includes(layer?.type ?? "")
          ? {
              name: layer?.title,
              datasetName: datasetTypeNames[(layer?.type ?? "") as PlateauDatasetType],
            }
          : undefined,
      ),
    )
    .filter(v => !!v && !!Object.keys(v).length);
  const rootPropertyNames = rawRootProperties.flatMap(p => Object.keys(p ?? {}));
  const rootProperties: { name: string; values: any[] }[] = rootPropertyNames
    .map(name => ({
      name,
      values: rawRootProperties.map((p: any) => p[name]).filter(isNotNullish),
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
        values.slice(1).every((value: any) => typeof value === type)
      );
    });

  const shouldDisplayNonRootProperties = features.length === 1;
  const rowRestProperties = shouldDisplayNonRootProperties
    ? features
        ?.map(f => getAttributes(f.properties?.attributes ?? {}, "label"))
        .filter(v => !!v && !!Object.keys(v).length)
    : undefined;
  return [
    // Root properties
    ...rootProperties,
    // All attributes
    ...(shouldDisplayNonRootProperties && !!rowRestProperties?.length
      ? [{ name: "全ての属性", values: rowRestProperties ?? {} }]
      : []),
    // Others which don't have the root property and attributes.
    ...(!rootProperties.length && !rowRestProperties?.length
      ? intersection(...features.map(f => Object.keys(f.properties))).map(name => ({
          name,
          values: features.map(f => f.properties?.[name]).filter(isNotNullish),
        }))
      : []),
  ];
};

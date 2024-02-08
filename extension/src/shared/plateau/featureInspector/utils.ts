import JP from "jsonpath";
import { intersection } from "lodash-es";

import { LayerModel } from "../../../prototypes/layers";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { layerDatasetTypes } from "../../../prototypes/view/constants/datasetTypeLayers";
import { datasetTypeNames } from "../../../prototypes/view/constants/datasetTypeNames";
import { Feature } from "../../reearth/types/layer";
import { RootLayerForDataset } from "../../view-layers";

import { getAttributeLabel, getRootFields } from "./attributes";

const attributesKey = "attributes";

const parseJsonPathAsNodes = (obj: any, path: string) => {
  try {
    return JP.nodes(obj, path);
  } catch (e) {
    console.error("FeatureInpector error: ", e);
    return;
  }
};

// `process` should be like `[from (|| from), to]`
export const parseProcess = (process: string | undefined) => {
  if (!process) return;
  if (!process.startsWith("[") || !process.endsWith("]")) return;
  const splitProcess = process.slice(1, -1).split(/ ?, ?/);
  if (splitProcess.length !== 2) return;
  const conditions = splitProcess[0].split(/ ?\|\| ?/);
  const result = splitProcess[1];
  return {
    conditions,
    result,
  };
};

export const makePropertyForFeatureInspector = ({
  features,
  featureInspector,
  layer,
  builtin,
}: {
  featureInspector?: RootLayerForDataset["featureInspector"];
  layer: LayerModel | undefined;
  features: Pick<Feature, "properties">[];
  builtin?: boolean;
}) => {
  const shouldUseSettingProperty =
    (!builtin && featureInspector?.basic?.displayType === "auto") ||
    featureInspector?.basic?.displayType === "propertyList";

  const convertedFeatureInspectorProperties = shouldUseSettingProperty
    ? featureInspector?.emphasisProperty?.properties?.map(p => {
        // NOTE: This process is really slow when a lot of features are selected, because JSON Path will be parsed by each feature.
        const nodes = features
          .flatMap(f => (p.jsonPath ? parseJsonPathAsNodes(f.properties, p.jsonPath) : undefined))
          .filter(isNotNullish);
        return {
          ...p,
          nodes,
        };
      })
    : [];
  const settingRootPropertyNames = convertedFeatureInspectorProperties
    ?.map(p =>
      p.nodes.length === features.length
        ? p.nodes[0]?.path.find(key => key !== "$") // Get first value which isn't `$`.
        : undefined,
    )
    .filter(isNotNullish);
  const settingRootProperties =
    convertedFeatureInspectorProperties
      ?.map(p => {
        if (!p.visible) return;
        const lastPathName = p.nodes[0]?.path
          .slice()
          .reverse()
          .find((key): key is string => isNaN(Number(key))); // Find string key
        const label = lastPathName ? getAttributeLabel(lastPathName) : undefined;
        return {
          name: p.displayName || label || lastPathName,
          // TODO: Evaluate `process` in here.
          values: p.nodes
            .map(n => {
              if (!n) return;

              const parsedProcess = parseProcess(p.process);
              if (!parsedProcess) return n.value;

              const match = parsedProcess?.conditions.some(cond => {
                if (isNaN(Number(cond))) {
                  return n.value === cond;
                }
                return n.value === Number(cond) || n.value === cond;
              });
              return match ? parsedProcess.result : n.value;
            })
            .filter(isNotNullish),
        };
      })
      .filter(v => v && !!v.values.length) ?? [];

  // Built-in root properties
  const datasetType = layer
    ? layerDatasetTypes[layer.type] ?? layerDatasetTypes.USE_CASE_LAYER
    : undefined;
  const rawBuiltInRootProperties = !shouldUseSettingProperty
    ? features
        .map(f =>
          layer && "title" in layer
            ? getRootFields(f.properties, datasetType, {
                name: layer?.title,
                datasetName: datasetType
                  ? datasetTypeNames[datasetType] ?? datasetTypeNames.usecase
                  : undefined,
              })
            : undefined,
        )
        .filter(v => !!v && !!Object.keys(v).length)
    : [];
  const builtInRootPropertyNames = intersection(
    rawBuiltInRootProperties.flatMap(p => Object.keys(p ?? {})),
  );
  const builtInRootProperties: { name: string; values: any[] }[] = builtInRootPropertyNames
    .map(name => ({
      name,
      values: rawBuiltInRootProperties.map((p: any) => p[name]).filter(Boolean),
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

  // All attributes
  const shouldDisplayAllAttributes = features.length === 1;
  const rawAllAttributes = shouldDisplayAllAttributes
    ? features
        ?.map(f => f.properties?.[attributesKey] ?? {})
        .filter(v => !!v && !!Object.keys(v).length)
    : undefined;

  return [
    // Root properties
    ...builtInRootProperties,
    ...settingRootProperties,
    // Others which don't have the root property and attributes.
    ...intersection(...features.map(f => Object.keys(f.properties)))
      .filter(n => {
        if (n === attributesKey) return false;
        return (
          !builtInRootPropertyNames.includes(getAttributeLabel(n) ?? n) &&
          !settingRootPropertyNames?.includes(n)
        );
      })
      .map(name => ({
        name: getAttributeLabel(name) || name,
        values: features.map(f => f.properties?.[name]).filter(Boolean),
      }))
      .filter(({ values }) => features.length === values.length),
    // All attributes
    ...(rawAllAttributes?.length ? [{ name: "全ての属性", values: rawAllAttributes ?? {} }] : []),
  ];
};

const UNION_MAP = {
  code: "コード",
  _code: "コード",
  uom: "単位",
  _uom: "単位",
};

export const makePropertyName = (name: string) => {
  const split = name.split(/_uro:/);
  const next = split[1] ? `uro:${split[1]}` : split[0];
  const first = getAttributeLabel(next);
  if (first) return first;

  // Find joined a name by `_` instead of `:`.
  const second = getAttributeLabel(next.replace("_", ":"));
  if (second) return second;

  // Find a name which has a suffix for union.
  const third = Object.entries(UNION_MAP)
    .map(([key, val]) => {
      if (!next.endsWith(key)) return;

      const attr = getAttributeLabel(next.split(key)[0]);
      if (!attr) return;

      return attr + val;
    })
    .filter(Boolean)[0];
  if (third) return third;
  return next.replaceAll("_", "");
};

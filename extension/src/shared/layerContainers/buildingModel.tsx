import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { ColorMap } from "../../prototypes/color-maps";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { colorModeAtom } from "../../prototypes/shared-states";
import { ViewLayerModel } from "../../prototypes/view-layers";
import { numberOrString, variable } from "../helpers";
import { useOptionalAtomValue } from "../hooks";
import { PlateauTilesetProperties, TileFeatureIndex } from "../plateau";
import { TILESET_FEATURE, TilesetLayer, TilesetProps } from "../reearth/layers";
import { Cesium3DTilesAppearance, ConditionsExpression, LayerAppearance } from "../reearth/types";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_BUILDING_MODEL_FILTER,
  TILESET_CLIPPING,
  TILESET_WIREFRAME,
  TILESET_DISABLE_DEFAULT_MATERIAL,
} from "../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../types/fieldComponents/general";
import { SearchedFeatures } from "../view-layers";
import { ComponentAtom } from "../view-layers/component";
import { useFindComponent } from "../view-layers/hooks";

import { useClippingBox } from "./hooks/useClippingBox";
import { useEvaluateFeatureColor } from "./hooks/useEvaluateFeatureColor";
import { useEvaluateFilter } from "./hooks/useEvaluateFilter";

type TilesetContainerProps = Omit<TilesetProps, "appearance" | "boxAppearance"> & {
  id: string;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<PlateauTilesetProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  hiddenFeaturesAtom: PrimitiveAtom<readonly string[] | null>;
  searchedFeaturesAtom: PrimitiveAtom<SearchedFeatures | null>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
  selections?: ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[];
  hidden: boolean;
  textured?: boolean;
  componentAtoms: ComponentAtom[];
};

export const BuildingModelLayerContainer: FC<TilesetContainerProps> = ({
  id,
  onLoad,
  layerIdAtom,
  featureIndexAtom,
  propertiesAtom,
  colorPropertyAtom,
  colorSchemeAtom,
  componentAtoms,
  selections,
  hidden,
  hiddenFeaturesAtom,
  searchedFeaturesAtom,
  textured,
  ...props
}) => {
  const [featureIndex, setFeatureIndex] = useAtom(featureIndexAtom);
  const [layerId, setLayerId] = useAtom(layerIdAtom);
  useScreenSpaceSelectionResponder({
    type: TILESET_FEATURE,
    convertToSelection: object => {
      return "id" in object &&
        typeof object.id === "string" &&
        featureIndex &&
        layerId &&
        "layerId" in object &&
        object.layerId === layerId
        ? {
            type: TILESET_FEATURE,
            value: {
              key: object.id,
              layerId,
              featureIndex,
              datasetId: id,
            },
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof TILESET_FEATURE> => {
      return value.type === TILESET_FEATURE && !!value.value && value.value.layerId === layerId;
    },
    onSelect: value => {
      if (featureIndex?.selectedFeatureIds.has(value.value.key)) {
        return;
      }
      featureIndex?.select([value.value.key]);
    },
    onDeselect: value => {
      if (!featureIndex?.selectedFeatureIds.has(value.value.key)) {
        return;
      }
      featureIndex?.unselect([value.value.key]);
    },
    // computeBoundingSphere: (value, result = new BoundingSphere()) => {
    //   computeCartographicToCartesian(scene, location, result.center);
    //   result.radius = 200; // Arbitrary size
    //   return result;
    // },
  });

  const setProperties = useSetAtom(propertiesAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      onLoad?.(layerId);
      setLayerId(layerId);
      setFeatureIndex(new TileFeatureIndex(layerId));
      setProperties(new PlateauTilesetProperties(layerId));
    },
    [onLoad, setFeatureIndex, setProperties, setLayerId],
  );

  const colorProperty = useAtomValue(colorPropertyAtom);
  const colorScheme = useAtomValue(colorSchemeAtom);

  // Field components
  const opacityAtom = useFindComponent(componentAtoms, OPACITY_FIELD);
  const buildingModelColorAtom = useFindComponent(componentAtoms, TILESET_BUILDING_MODEL_COLOR);
  const [clippingBox, boxAppearance] = useClippingBox(
    useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_CLIPPING)),
  );

  const filter = useEvaluateFilter(
    useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_BUILDING_MODEL_FILTER)),
  );
  const wireframeAtom = useFindComponent(componentAtoms, TILESET_WIREFRAME);

  const disableDefaultMaterialAtom = useFindComponent(
    componentAtoms,
    TILESET_DISABLE_DEFAULT_MATERIAL,
  );

  const hiddenFeatures = useAtomValue(hiddenFeaturesAtom);
  const hiddenFeaturesConditions: ConditionsExpression = {
    conditions: [[`${JSON.stringify(hiddenFeatures)}` + "== ${gml_id}", "false"]],
  };

  const searchedFeatures = useAtomValue(searchedFeaturesAtom);
  const shownSearchedFeaturesConditions: ConditionsExpression | undefined = useMemo(
    () =>
      searchedFeatures?.onlyShow
        ? {
            conditions: [
              ...(searchedFeatures?.conditions?.flatMap(([key, values]) =>
                values.map(
                  v => [`${variable(key)} === ${numberOrString(v)}`, "true"] as [string, string],
                ),
              ) ?? []),
              ...hiddenFeaturesConditions.conditions,
              ...(filter.conditions[0].every(c => c === "true") ? [] : filter.conditions),
              ["true", "false"],
            ],
          }
        : undefined,
    [
      searchedFeatures?.onlyShow,
      searchedFeatures?.conditions,
      hiddenFeaturesConditions.conditions,
      filter.conditions,
    ],
  );

  const colorMode = useAtomValue(colorModeAtom);

  const opacity = useOptionalAtomValue(opacityAtom);
  const wireframeView = useOptionalAtomValue(wireframeAtom);
  const disableDefaultMaterial = useOptionalAtomValue(disableDefaultMaterialAtom);

  const color = useEvaluateFeatureColor({
    colorProperty: buildingModelColorAtom ? colorProperty ?? undefined : undefined,
    colorScheme: buildingModelColorAtom ? colorScheme ?? undefined : undefined,
    opacity: opacity?.value,
    selections,
    defaultColor:
      colorMode === "light" ? { r: 255, g: 255, b: 255, a: 1 } : { r: 68, g: 68, b: 68, a: 1 },
  });

  const theme = useTheme();

  const enableShadow = !opacity?.value || opacity.value === 1;

  const appearance: LayerAppearance<Cesium3DTilesAppearance> = useMemo(
    () => ({
      pbr: disableDefaultMaterial?.value?.disableDefaultMaterial
        ? false
        : textured
        ? "withTexture"
        : false,
      ...(color
        ? {
            color: {
              expression: color,
            },
          }
        : {}),
      show: {
        expression: {
          conditions: shownSearchedFeaturesConditions
            ? [...shownSearchedFeaturesConditions.conditions]
            : [...hiddenFeaturesConditions.conditions, ...filter.conditions],
        },
      },
      shadows: enableShadow ? "enabled" : "disabled",
      selectedFeatureColor: theme.palette.primary.main,
      experimental_clipping: clippingBox,
      showWireframe: wireframeView?.value?.wireframe,
    }),
    [
      textured,
      color,
      shownSearchedFeaturesConditions,
      hiddenFeaturesConditions.conditions,
      filter.conditions,
      enableShadow,
      theme.palette.primary.main,
      clippingBox,
      wireframeView,
      disableDefaultMaterial?.value?.disableDefaultMaterial,
    ],
  );

  return (
    <TilesetLayer
      {...props}
      onLoad={handleLoad}
      appearance={appearance}
      boxAppearance={boxAppearance}
      visible={!hidden}
    />
  );
};

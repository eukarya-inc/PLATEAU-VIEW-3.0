import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { ColorMap } from "../../prototypes/color-maps";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { ViewLayerModel } from "../../prototypes/view-layers";
import { useOptionalAtomValue } from "../hooks";
import { PlateauTilesetProperties, TileFeatureIndex } from "../plateau";
import { TILESET_FEATURE, TilesetLayer, TilesetProps } from "../reearth/layers";
import { Cesium3DTilesAppearance, LayerAppearance } from "../reearth/types";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_BUILDING_MODEL_FILTER,
  TILESET_CLIPPING,
} from "../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../types/fieldComponents/general";
import { ComponentAtom } from "../view-layers/component";
import { useFindComponent } from "../view-layers/hooks";

import { useClippingBox } from "./hooks/useClippingBox";
import { useEvaluateBuildingModelFilter } from "./hooks/useEvaluateBuildingModelFilter";
import { useEvaluateFeatureColor } from "./hooks/useEvaluateFeatureColor";

type TilesetContainerProps = Omit<TilesetProps, "appearance" | "boxAppearance"> & {
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<PlateauTilesetProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
  selections?: ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[];
  hidden: boolean;
  textured?: boolean;
  componentAtoms: ComponentAtom[];
};

export const TilesetLayerContainer: FC<TilesetContainerProps> = ({
  onLoad,
  layerIdAtom,
  featureIndexAtom,
  propertiesAtom,
  colorPropertyAtom,
  colorSchemeAtom,
  componentAtoms,
  selections,
  hidden,
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
  const filter = useEvaluateBuildingModelFilter(
    useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_BUILDING_MODEL_FILTER)),
  );

  const opacity = useOptionalAtomValue(opacityAtom);
  const color = useEvaluateFeatureColor({
    colorProperty: buildingModelColorAtom ? colorProperty ?? undefined : undefined,
    colorScheme: buildingModelColorAtom ? colorScheme ?? undefined : undefined,
    opacity: opacity?.value,
    selections,
  });

  const theme = useTheme();

  const enableShadow = !opacity || opacity.value === 1;

  const appearance: LayerAppearance<Cesium3DTilesAppearance> = useMemo(
    () => ({
      pbr: textured,
      ...(color
        ? {
            color: {
              expression: color,
            },
          }
        : {}),
      show: filter,
      shadows: enableShadow ? "enabled" : "disabled",
      selectedFeatureColor: theme.palette.primary.main,
      experimental_clipping: clippingBox,
    }),
    [color, enableShadow, textured, theme.palette.primary.main, clippingBox, filter],
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

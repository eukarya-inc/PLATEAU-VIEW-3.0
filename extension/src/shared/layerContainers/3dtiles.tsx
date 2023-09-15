import { PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback } from "react";

import { ColorMap } from "../../prototypes/color-maps";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { ViewLayerModel } from "../../prototypes/view-layers";
import { PlateauProperties, TileFeatureIndex } from "../plateau";
import { TILESET_FEATURE, TilesetLayer, TilesetProps } from "../reearth/layers";

import { useEvaluateFeatureColor } from "./hooks/useEvaluateFeatureColor";

type TilesetContainerProps = TilesetProps & {
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<PlateauProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
  opacityAtom: PrimitiveAtom<number>;
  selections?: ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[];
};

export const TilesetLayerContainer: FC<TilesetContainerProps> = ({
  onLoad,
  layerIdAtom,
  featureIndexAtom,
  propertiesAtom,
  colorPropertyAtom,
  colorSchemeAtom,
  opacityAtom,
  selections,
  ...props
}) => {
  const layerId = useAtomValue(layerIdAtom);
  useScreenSpaceSelectionResponder({
    type: TILESET_FEATURE,
    convertToSelection: object => {
      return "id" in object && typeof object.id === "string" && !!layerId
        ? {
            type: TILESET_FEATURE,
            value: {
              key: object.id,
              layerId,
            },
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof TILESET_FEATURE> => {
      return value.type === TILESET_FEATURE && !!value.value && !!layerId;
    },
    // computeBoundingSphere: (value, result = new BoundingSphere()) => {
    //   computeCartographicToCartesian(scene, location, result.center);
    //   result.radius = 200; // Arbitrary size
    //   return result;
    // },
  });

  const setFeatureIndex = useSetAtom(featureIndexAtom);
  const setProperties = useSetAtom(propertiesAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      onLoad?.(layerId);
      setFeatureIndex(new TileFeatureIndex(layerId));
      setProperties(new PlateauProperties(layerId));
    },
    [onLoad, setFeatureIndex, setProperties],
  );

  const colorProperty = useAtomValue(colorPropertyAtom);
  const colorScheme = useAtomValue(colorSchemeAtom);
  const opacity = useAtomValue(opacityAtom);
  const color = useEvaluateFeatureColor({
    colorProperty: colorProperty ?? undefined,
    colorScheme: colorScheme ?? undefined,
    opacity,
    selections,
  });

  return (
    <TilesetLayer
      {...props}
      onLoad={handleLoad}
      color={color}
      enableShadow={!opacity || opacity === 1}
    />
  );
};

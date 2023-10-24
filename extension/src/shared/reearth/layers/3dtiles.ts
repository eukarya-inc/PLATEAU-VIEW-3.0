import { FC, useEffect, useMemo, useRef } from "react";

import { TileFeatureIndex } from "../../plateau";
import { Cesium3DTilesAppearance, LayerAppearance } from "../types";

export const TILESET_FEATURE = "TILESET_FEATURE";

declare module "../../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [TILESET_FEATURE]: {
      key: string;
      layerId: string;
      featureIndex: TileFeatureIndex;
    };
  }
}

export type Tileset = {};
export type TilesetFeature<P> = {
  properties: P;
};

export type TilesetProps = {
  url: string;
  onLoad?: (layerId: string) => void;
  color?: string;
  enableShadow?: boolean;
  show?: string | boolean;
  visible?: boolean;
  selectedFeatureColor?: string;
  textured?: boolean;
};

export const TilesetLayer: FC<TilesetProps> = ({
  url,
  onLoad,
  color,
  enableShadow,
  show,
  visible,
  selectedFeatureColor,
  textured,
}) => {
  const layerIdRef = useRef<string>();
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
      show:
        typeof show === "string"
          ? {
              expression: show,
            }
          : show,
      shadows: enableShadow ? "enabled" : "disabled",
      selectedFeatureColor,
    }),
    [color, enableShadow, show, selectedFeatureColor, textured],
  );

  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: {
        type: "3dtiles",
        idProperty: "gml_id",
        url,
      },
      "3dtiles": appearance,
    });

    layerIdRef.current = layerId;

    return () => {
      if (!layerId) return;
      window.reearth?.layers?.delete?.(layerId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;

    window.reearth?.layers?.override?.(layerId, {
      data: {
        type: "3dtiles",
        idProperty: "gml_id",
        url,
      },
      visible,
      ["3dtiles"]: appearance,
    });
  }, [appearance, visible, url]);

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;
    setTimeout(() => {
      if (layerId) {
        onLoad?.(layerId);
      }
    }, 0);
  }, [onLoad, url]);

  return null;
};
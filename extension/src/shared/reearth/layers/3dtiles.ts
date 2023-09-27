import { FC, useEffect, useMemo, useRef } from "react";

import { Cesium3DTilesAppearance, LayerAppearance } from "../types";

export const TILESET_FEATURE = "TILESET_FEATURE";

declare module "../../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [TILESET_FEATURE]: {
      key: string;
      layerId: string;
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
};

export const TilesetLayer: FC<TilesetProps> = ({ url, onLoad, color, enableShadow, show }) => {
  const layerIdRef = useRef<string>();
  const appearance: LayerAppearance<Cesium3DTilesAppearance> = useMemo(
    () => ({
      pbr: false,
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
    }),
    [color, enableShadow, show],
  );

  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: {
        type: "3dtiles",
        url,
      },
      "3dtiles": appearance,
    });

    layerIdRef.current = layerId;

    setTimeout(() => {
      if (layerId) {
        onLoad?.(layerId);
      }
    }, 0);

    return () => {
      if (!layerId) return;
      window.reearth?.layers?.delete?.(layerId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;

    window.reearth?.layers?.override?.(layerId, {
      ["3dtiles"]: appearance,
    });
  }, [appearance]);

  return null;
};

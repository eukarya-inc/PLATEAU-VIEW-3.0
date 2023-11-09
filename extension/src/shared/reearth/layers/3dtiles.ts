import { FC, useEffect, useRef } from "react";

import { TileFeatureIndex } from "../../plateau";
import { BoxAppearance, Cesium3DTilesAppearance, LayerAppearance } from "../types";

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
  visible?: boolean;
  appearance: LayerAppearance<Cesium3DTilesAppearance>;
  boxAppearance: LayerAppearance<BoxAppearance> | undefined;
};

export const TilesetLayer: FC<TilesetProps> = ({
  url,
  onLoad,
  visible,
  appearance,
  boxAppearance,
}) => {
  const layerIdRef = useRef<string>();

  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: {
        type: "3dtiles",
        idProperty: "gml_id",
        url,
      },
      "3dtiles": appearance,
      box: boxAppearance,
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
      box: boxAppearance,
    });
  }, [appearance, visible, url, boxAppearance]);

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

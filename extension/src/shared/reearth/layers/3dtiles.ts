import { FC, useMemo } from "react";

import {
  BoxAppearance,
  Cesium3DTilesAppearance,
  LayerAppearance,
} from "../../../shared/reearth/types";
import { TileFeatureIndex } from "../../plateau";
import { useLayer } from "../hooks";
import { Data } from "../types/layer";

export const TILESET_FEATURE = "TILESET_FEATURE";

declare module "../../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [TILESET_FEATURE]: {
      key: string;
      layerId: string;
      featureIndex: TileFeatureIndex;
      datasetId: string;
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
  boxAppearance?: LayerAppearance<BoxAppearance>;
};

export const TilesetLayer: FC<TilesetProps> = ({
  url,
  onLoad,
  visible,
  appearance,
  boxAppearance,
}) => {
  const data: Data = useMemo(
    () => ({
      type: "3dtiles",
      idProperty: "gml_id",
      url,
    }),
    [url],
  );
  const appearances = useMemo(
    () => ({
      ["3dtiles"]: appearance,
      box: {
        ...boxAppearance,
        hideIndicator: true,
      },
    }),
    [appearance, boxAppearance],
  );
  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });

  return null;
};

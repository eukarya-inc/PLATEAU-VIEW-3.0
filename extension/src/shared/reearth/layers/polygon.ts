import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type PolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon">>;

export type PolygonProps = {
  features: any;
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances?: PolygonAppearances;
};

export const POLYGON_LAYER_ID_PROPERTY = "polygonLayerID";

export const PolygonLayer: FC<PolygonProps> = ({ features, onLoad, visible, appearances }) => {
  const mergedAppearances: PolygonAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      polygon: {
        ...(appearances?.polygon ?? {}),
        hideIndicator: true,
      },
    }),
    [appearances],
  );

  console.log("features", features)
  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: {
        type: "FeatureCollection",
        features: features.map(f => ({ ...f })),
      },
    }),
    [features],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};

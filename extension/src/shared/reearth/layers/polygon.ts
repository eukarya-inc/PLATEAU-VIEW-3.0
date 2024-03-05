import { type FeatureCollection } from "geojson";
import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type PolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon">>;

export type PolygonProps = {
  polygonFeatures: FeatureCollection;
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances?: PolygonAppearances;
};

export const PolygonLayer: FC<PolygonProps> = ({
  polygonFeatures,
  onLoad,
  visible,
  appearances,
}) => {
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

  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: {
        type: "FeatureCollection",
        features: polygonFeatures.features.map(f => f),
      },
    }),
    [polygonFeatures],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};

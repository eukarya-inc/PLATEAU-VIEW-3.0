import { FC, useMemo } from "react";

import { PLATEAU_GEOJSON_URL } from "../../constants";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type PolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon">>;

export type PolygonProps = {
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances?: PolygonAppearances;
};

export const PolygonLayer: FC<PolygonProps> = ({ onLoad, visible, appearances }) => {
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

  const url = `${PLATEAU_GEOJSON_URL}/govpolygon/plateaugovs.geojson`;
  const data: Data = useMemo(
    () => ({
      type: "geojson",
      url,
    }),
    [url],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};

import { FC, useMemo } from "react";

import { usePlateauApiUrl } from "../../states/environmentVariables";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type PolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon" | "resource">>;

export type PolygonProps = {
  onLoad?: (layerId: string) => void;
  appearances?: PolygonAppearances;
};

export const PolygonLayer: FC<PolygonProps> = ({ onLoad, appearances }) => {
  const [plateauGeojsonUrl] = usePlateauApiUrl();
  const mergedAppearances: PolygonAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      polygon: {
        ...(appearances?.polygon ?? {}),
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "geojson",
      url: plateauGeojsonUrl,
    }),
    [plateauGeojsonUrl],
  );

  useLayer({
    data,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};

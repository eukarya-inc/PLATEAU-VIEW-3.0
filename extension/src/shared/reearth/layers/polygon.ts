import { FC, useMemo } from "react";

import { usePlateauGeojsonUrl } from "../../states/environmentVariables";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type PolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon" | "resource">>;

export type PolygonProps = {
  onLoad?: (layerId: string) => void;
  appearances?: PolygonAppearances;
  visible?: boolean;
};

export const PolygonLayer: FC<PolygonProps> = ({ onLoad, appearances, visible }) => {
  const [plateauGeojsonUrl] = usePlateauGeojsonUrl();
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
      geojson: {
        useAsResource: true,
      },
    }),
    [plateauGeojsonUrl],
  );

  useLayer({
    data,
    appearances: mergedAppearances,
    onLoad,
    visible,
  });

  return null;
};

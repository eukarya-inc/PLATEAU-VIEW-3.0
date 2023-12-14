import { FC, useMemo } from "react";

import { useLayer } from "../../hooks";
import { LayerAppearanceTypes } from "../../types";
import { Data } from "../../types/layer";

export type PedestrianMarkerAppearances = Partial<Pick<LayerAppearanceTypes, "marker">>;

export type PedestrianMarkerProps = {
  id: string;
  coordinates: [lng: number, lat: number, height: number];
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances: PedestrianMarkerAppearances;
};

export const PEDESTRIAN_MARKER_ID_PROPERTY = "pedestrianID";

export const PedestrianMarkerLayer: FC<PedestrianMarkerProps> = ({
  id,
  coordinates,
  onLoad,
  visible,
  appearances,
}) => {
  const mergedAppearances: PedestrianMarkerAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      marker: {
        ...(appearances.marker ?? {}),
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: {
        type: "Feature",
        properties: {
          [PEDESTRIAN_MARKER_ID_PROPERTY]: id,
        },
        geometry: {
          coordinates,
          type: "Point",
        },
      },
    }),
    [coordinates, id],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};

import { FC, useMemo } from "react";

import { StoryCapture } from "../../layerContainers/story";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type StoryAppearance = Partial<Pick<LayerAppearanceTypes, "marker">>;

export type StoryProps = {
  capture: StoryCapture;
  appearances: StoryAppearance;
  visible?: boolean;
  onLoad?: (layerId: string) => void;
};

export const StoryLayer: FC<StoryProps> = ({ capture, appearances, visible, onLoad }) => {
  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          coordinates: [capture.camera.lng, capture.camera.lat, capture.camera.height],
          type: "Point",
        },
      },
    }),
    [capture],
  );

  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });

  return null;
};

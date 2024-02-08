import { FC, useMemo } from "react";

import { StoryChapter } from "../../layerContainers/story";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type StoryAppearance = Partial<Pick<LayerAppearanceTypes, "marker">>;

export type StoryProps = {
  chapter: StoryChapter;
  appearances: StoryAppearance;
  visible?: boolean;
  onLoad?: (layerId: string) => void;
};

export const StoryLayer: FC<StoryProps> = ({ chapter, appearances, visible, onLoad }) => {
  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          coordinates: [chapter.camera.lng, chapter.camera.lat],
          type: "Point",
        },
      },
    }),
    [chapter],
  );

  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });

  return null;
};

import { FC, useMemo } from "react";

import { composeIdentifier } from "../../../prototypes/cesium-helpers";
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

export const STORY_MARKER_ID_PROPERTY = "storyCaptureID";

export const StoryLayer: FC<StoryProps> = ({ capture, appearances, visible, onLoad }) => {
  const data: Data = useMemo(() => {
    const objectId = composeIdentifier({
      type: "Story",
      key: capture.id,
    });

    return {
      type: "geojson",
      value: {
        type: "Feature",
        properties: {
          [STORY_MARKER_ID_PROPERTY]: objectId,
        },
        geometry: {
          coordinates: [capture.camera.lng, capture.camera.lat, capture.camera.height],
          type: "Point",
        },
      },
    };
  }, [capture]);

  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });

  return null;
};

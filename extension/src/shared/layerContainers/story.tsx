import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { FC, useCallback, useMemo } from "react";

import balloonImage from "../../prototypes/pedestrian/assets/balloon.png";
import iconImage from "../../prototypes/pedestrian/assets/icon.png";
import { StoryAppearance, StoryLayer } from "../reearth/layers/story";
import { CameraPosition } from "../reearth/types";

export type StoryChapter = {
  id: string;
  title?: string;
  content?: string;
  camera: CameraPosition;
};

type StoryContainerProps = {
  chaptersAtom: PrimitiveAtom<StoryChapter[]>;
  onLoad: (layerId: string) => void;
};

export const StoryLayerContainer: FC<StoryContainerProps> = ({ chaptersAtom, onLoad }) => {
  const chapters = useAtomValue(chaptersAtom);

  const handleLoad = useCallback(
    (layerId: string) => {
      onLoad?.(layerId);
    },
    [onLoad],
  );

  return (
    <>
      {chapters.map(chapter => (
        <StoryObject key={chapter.id} chapter={chapter} onLoad={handleLoad} />
      ))}
    </>
  );
};

type StoryObjectProps = {
  chapter: StoryChapter;
  onLoad: (layerId: string) => void;
};

const StoryObject: FC<StoryObjectProps> = ({ chapter, onLoad }) => {
  const theme = useTheme();
  const selected = false;

  const balloonAppearance: StoryAppearance = useMemo(
    () => ({
      marker: {
        image: balloonImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        eyeOffset: [0, 0, -10],
        imageColor: selected ? theme.palette.primary.main : "#000000",
      },
    }),
    [selected, theme],
  );
  const iconAppearance: StoryAppearance = useMemo(
    () => ({
      marker: {
        image: iconImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        // WORKAROUND: Render front of balloon.
        eyeOffset: [0, 0, -10.1],
      },
    }),
    [],
  );
  return (
    <>
      <StoryLayer chapter={chapter} onLoad={onLoad} appearances={balloonAppearance} />
      <StoryLayer chapter={chapter} onLoad={onLoad} appearances={iconAppearance} />
    </>
  );
};

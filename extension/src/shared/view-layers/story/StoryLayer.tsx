import { PrimitiveAtom, atom, useAtomValue } from "jotai";
import { FC, useCallback } from "react";

import { LayerProps } from "../../../prototypes/layers";
import {
  ConfigurableLayerModel,
  STORY_LAYER,
  ViewLayerModelParams,
  createViewLayerModel,
} from "../../../prototypes/view-layers";
import { StoryChapter, StoryLayerContainer } from "../../layerContainers/story";
import { LayerModel } from "../model";

export interface StoryLayerModelParams extends ViewLayerModelParams {
  title: string;
  chapters?: readonly StoryChapter[];
}

export interface StoryLayerModel extends LayerModel {
  title: string;
  chaptersAtom: PrimitiveAtom<StoryChapter[]>;
}

export function createStoryLayer(
  params: StoryLayerModelParams,
): ConfigurableLayerModel<StoryLayerModel> {
  const chaptersAtom = atom<StoryChapter[]>([...(params.chapters ?? [])]);
  return {
    ...createViewLayerModel(params),
    type: STORY_LAYER,
    title: params.title,
    chaptersAtom,
  };
}

export const StoryLayer: FC<LayerProps<typeof STORY_LAYER>> = ({
  hiddenAtom,
  chaptersAtom,
  ...props
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const handleLoad = useCallback(() => {}, []);

  if (hidden) {
    return null;
  }
  return <StoryLayerContainer chaptersAtom={chaptersAtom} onLoad={handleLoad} {...props} />;
};

import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { ChangeEvent, FC, useCallback, useMemo, useState } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { StoryIcon } from "../../../prototypes/ui-components";
import { STORY_LAYER } from "../../../prototypes/view-layers";
import { ViewDialog, ViewTextField, ViewLabel } from "../../ui-components/common";
import { createRootLayerForLayerAtom } from "../../view-layers";
import { showCreateStoryAtom } from "../state/story";

export const StoryCreator: FC = () => {
  const [showCreateStory, setShowCreateStory] = useAtom(showCreateStoryAtom);
  const handleClose = useCallback(() => {
    setShowCreateStory(false);
    setStoryName("");
  }, [setShowCreateStory]);

  const [storyName, setStoryName] = useState("");
  const handleStoryNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setStoryName(event.target.value);
    },
    [],
  );
  const disableSubmit = useMemo(() => !storyName.trim(), [storyName]);

  const addLayer = useAddLayer();
  const handleCreate = useCallback(() => {
    const id = nanoid();
    addLayer(
      createRootLayerForLayerAtom({
        id,
        type: STORY_LAYER,
        title: storyName,
        chapters: [],
      }),
      { autoSelect: false },
    );
    handleClose();
  }, [storyName, addLayer, handleClose]);

  return (
    <ViewDialog
      icon={<StoryIcon />}
      title="Create a new story"
      open={showCreateStory}
      disableSubmit={disableSubmit}
      onClose={handleClose}
      onSubmit={handleCreate}>
      <ViewLabel>Story name</ViewLabel>
      <ViewTextField value={storyName} onChange={handleStoryNameChange} />
    </ViewDialog>
  );
};

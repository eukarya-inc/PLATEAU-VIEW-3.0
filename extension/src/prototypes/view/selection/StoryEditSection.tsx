import { Button, styled } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { StoryCapture } from "../../../shared/layerContainers/story";
import { useCamera } from "../../../shared/reearth/hooks";
import {
  ViewContentColumn,
  ViewDialog,
  ViewMarkdownEditor,
  ViewTextField,
} from "../../../shared/ui-components/common";
import { CaptureList } from "../../../shared/ui-components/story/CaptureList";
import { LayerModel } from "../../layers";
import { CameraIcon } from "../../ui-components";
import { STORY_LAYER } from "../../view-layers";
import { preventToolKeyDownAtom } from "../states/tool";

type StoryEditSectionProps = {
  layer: LayerModel<typeof STORY_LAYER>;
};

export const StoryEditSection: FC<StoryEditSectionProps> = ({ layer }) => {
  const [captures, setCaptures] = useAtom(layer.capturesAtom);

  const [editorOpen, setEditorOpen] = useState(false);
  const [currentCapture, setCurrentCapture] = useState<StoryCapture | null>(null);

  const { getCameraPosition } = useCamera();

  const handleOpenNewCapture = useCallback(() => {
    const camera = getCameraPosition();
    if (!camera) return;

    setCurrentCapture({
      id: nanoid(),
      title: "",
      content: "",
      camera,
    });
    setEditorOpen(true);
  }, [getCameraPosition]);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
    setCurrentCapture(null);
  }, []);

  const handleCaptureTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!currentCapture) return;
      setCurrentCapture({ ...currentCapture, title: event.target.value });
    },
    [currentCapture],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      console.log(value);
      if (!currentCapture) return;
      setCurrentCapture({ ...currentCapture, content: value });
    },
    [currentCapture],
  );

  const disableSubmit = useMemo(
    () => !currentCapture?.title?.trim() && !currentCapture?.content?.trim(),
    [currentCapture],
  );

  const handleSaveCaptures = useCallback(() => {
    if (!currentCapture) return;
    const index = captures.findIndex(c => c.id === currentCapture.id);
    if (index !== -1) {
      const newCaptures = [...captures];
      newCaptures[index] = currentCapture;
      setCaptures(newCaptures);
    } else {
      setCaptures([...captures, currentCapture]);
    }
    handleCloseEditor();
  }, [currentCapture, captures, setCaptures, handleCloseEditor]);

  const preventToolKeyDown = useSetAtom(preventToolKeyDownAtom);
  useEffect(() => {
    preventToolKeyDown(editorOpen);
  }, [editorOpen, preventToolKeyDown]);

  return (
    <SectionWrapper>
      <CaptureList captures={captures} />
      <ButtonWrapper>
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<CameraIcon />}
          onClick={handleOpenNewCapture}>
          New Capture
        </Button>
      </ButtonWrapper>

      <ViewDialog
        open={editorOpen}
        title="Capture Editor"
        icon={<CameraIcon />}
        disableSubmit={disableSubmit}
        onClose={handleCloseEditor}
        onSubmit={handleSaveCaptures}>
        <ViewContentColumn>
          <ViewTextField
            placeholder="Title"
            value={currentCapture?.title ?? ""}
            onChange={handleCaptureTitleChange}
          />
          <ViewMarkdownEditor
            value={currentCapture?.content ?? ""}
            onChange={handleContentChange}
          />
        </ViewContentColumn>
      </ViewDialog>
    </SectionWrapper>
  );
};

const SectionWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 0, 1, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
}));

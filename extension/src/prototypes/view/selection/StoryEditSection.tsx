import { styled } from "@mui/material";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { StoryCapture } from "../../../shared/layerContainers/story";
import { useCamera } from "../../../shared/reearth/hooks";
import { ViewDialog, ViewTextField } from "../../../shared/ui-components/common";
import { LayerModel } from "../../layers";
import { ButtonParameterItem, ParameterList, CameraIcon } from "../../ui-components";
import { STORY_LAYER } from "../../view-layers";

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

  useEffect(() => {
    console.log("captures", captures);
  }, [captures]);

  return (
    <ParameterList>
      {captures.map(capture => (
        <CaptureItem key={capture.id} capture={capture} />
      ))}
      <ButtonParameterItem onClick={handleOpenNewCapture}>
        <ButtonContent>
          <CameraIcon />
          New Capture
        </ButtonContent>
      </ButtonParameterItem>
      <ViewDialog
        open={editorOpen}
        title="Capture Editor"
        icon={<CameraIcon />}
        disableSubmit={disableSubmit}
        onClose={handleCloseEditor}
        onSubmit={handleSaveCaptures}>
        <ViewTextField
          placeholder="Title"
          value={currentCapture?.title ?? ""}
          onChange={handleCaptureTitleChange}
        />
      </ViewDialog>
    </ParameterList>
  );
};

type CaptureItemProps = {
  capture: StoryCapture;
};

const CaptureItem: FC<CaptureItemProps> = ({ capture }) => {
  return <div>{capture.id}</div>;
};

const ButtonContent = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

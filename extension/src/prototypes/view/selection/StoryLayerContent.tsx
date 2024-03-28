import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Divider,
  IconButton,
  List,
  Pagination,
  Tooltip,
  paginationItemClasses,
  styled,
  svgIconClasses,
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useCamera } from "../../../shared/reearth/hooks";
import { ViewMarkdownViewer } from "../../../shared/ui-components/common";
import { CaptureList } from "../../../shared/ui-components/story/CaptureList";
import { StoryCaptureEditor } from "../../../shared/view/ui-container/story/StoryCaptureEditor";
import { StoryTitleEditor } from "../../../shared/view/ui-container/story/StoryTitleEditor";
import { StoryCapture } from "../../../shared/view-layers";
import { LayerModel, layerSelectionAtom } from "../../layers";
import {
  AddressIcon,
  CameraIcon,
  InspectorHeader,
  LayerIcon,
  TrashIcon,
} from "../../ui-components";
import { STORY_LAYER, layerTypeIcons } from "../../view-layers";
import { LAYER_SELECTION, SelectionGroup } from "../states/selection";

export interface StoryLayerContentProps {
  values: (SelectionGroup & {
    type: typeof LAYER_SELECTION;
    subtype: typeof STORY_LAYER;
  })["values"];
}

export const StoryLayerContent: FC<StoryLayerContentProps> = ({ values }) => {
  invariant(values.length === 1);
  const { flyTo, getCameraPosition } = useCamera();

  const layer = values[0] as LayerModel<typeof STORY_LAYER>;
  const title = useAtomValue(layer.titleAtom);
  const layerTitle = useMemo(() => (typeof title === "object" ? title?.primary : title), [title]);

  const setSelection = useSetAtom(layerSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const [panel, setPanel] = useState<"list" | "player">("list");
  const [captures, setCaptures] = useAtom(layer.capturesAtom);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);

  const handleChange = useCallback(
    (_: React.ChangeEvent<unknown>, value: number) => {
      const index = value - 1;
      setCurrentCaptureIndex(index);
      flyTo(captures[index].camera);
    },
    [flyTo, captures],
  );

  const goList = useCallback(() => {
    setPanel("list");
  }, []);

  useEffect(() => {
    setPanel("list");
  }, [layer]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [newCapture, setNewCapture] = useState<StoryCapture | undefined>(undefined);

  const handleOpenNewCapture = useCallback(() => {
    const camera = getCameraPosition();
    if (!camera) return;
    setNewCapture({ id: nanoid(), camera });
    setEditorOpen(true);
  }, [getCameraPosition]);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const handleCaptureSave = useCallback(
    (capture: StoryCapture) => {
      const index = captures.findIndex(c => c.id === capture.id);
      if (index !== -1) {
        const newCaptures = [...captures];
        newCaptures[index] = capture;
        setCaptures(newCaptures);
      } else {
        setCaptures([...captures, capture]);
      }
      handleCloseEditor();
    },
    [captures, setCaptures, handleCloseEditor],
  );

  const handleCaptureRemove = useCallback(
    (id: string) => {
      setCaptures(captures.filter(c => c.id !== id));
    },
    [captures, setCaptures],
  );

  const handleCaptureClick = useCallback(
    (index: number) => {
      setPanel("player");
      setCurrentCaptureIndex(index);
      flyTo(captures[index].camera);
    },
    [captures, flyTo],
  );

  const handleFlyToCurrentCapture = useCallback(() => {
    flyTo(captures[currentCaptureIndex].camera);
  }, [flyTo, captures, currentCaptureIndex]);

  const handleRemoveCurrentCapture = useCallback(() => {
    goList();
    setCaptures(captures.filter(c => c.id !== captures[currentCaptureIndex].id));
  }, [captures, currentCaptureIndex, goList, setCaptures]);

  const [openTitleEditor, setOpenTitleEditor] = useState(false);
  const handleOpenTitleEditor = useCallback(() => {
    setOpenTitleEditor(true);
  }, []);
  const handleCloseTitleEditor = useCallback(() => {
    setOpenTitleEditor(false);
  }, []);

  return (
    <>
      <List disablePadding>
        <InspectorHeader
          title={panel === "list" ? "ストーリー" : layerTitle}
          iconComponent={layerTypeIcons.STORY_LAYER}
          onClose={handleClose}
          actions={
            panel === "list" ? null : (
              <>
                <Tooltip title="レイヤーを選択">
                  <IconButton aria-label="レイヤーを選択" onClick={goList}>
                    <LayerIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="移動">
                  <IconButton aria-label="移動" onClick={handleFlyToCurrentCapture}>
                    <AddressIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="削除">
                  <IconButton aria-label="削除" onClick={handleRemoveCurrentCapture}>
                    <TrashIcon />
                  </IconButton>
                </Tooltip>
              </>
            )
          }
        />
        <Divider />
        <SectionWrapper>
          {panel === "list" ? (
            <>
              <StoryTitleWrapper>
                <StoryTitle>{layerTitle}</StoryTitle>
                <StyledIconButton size="small" onClick={handleOpenTitleEditor}>
                  <EditOutlinedIcon />
                </StyledIconButton>
              </StoryTitleWrapper>
              <CaptureList
                captures={captures}
                onCaptureUpdate={handleCaptureSave}
                onCaptureRemove={handleCaptureRemove}
                onCaptureClick={handleCaptureClick}
              />
              <ButtonWrapper>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  startIcon={<CameraIcon />}
                  onClick={handleOpenNewCapture}>
                  新しいキャプチャ
                </Button>
              </ButtonWrapper>
              {editorOpen && (
                <StoryCaptureEditor
                  open={editorOpen}
                  capture={newCapture}
                  onClose={handleCloseEditor}
                  onSave={handleCaptureSave}
                />
              )}
            </>
          ) : (
            <>
              <Content>
                <CaptureTitle>{captures[currentCaptureIndex].title}</CaptureTitle>
                <ViewMarkdownViewer content={captures[currentCaptureIndex].content} />
              </Content>
              <PaginationWrapper>
                <StyledPagination
                  count={captures.length}
                  color="primary"
                  size="small"
                  shape="rounded"
                  page={currentCaptureIndex + 1}
                  siblingCount={1}
                  boundaryCount={1}
                  onChange={handleChange}
                />
              </PaginationWrapper>
            </>
          )}
        </SectionWrapper>
      </List>
      <StoryTitleEditor open={openTitleEditor} layer={layer} onClose={handleCloseTitleEditor} />
    </>
  );
};

const SectionWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(2, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
}));

const PaginationWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  margin: theme.spacing(1, 0, 0, 0),
  [`.${paginationItemClasses.root}.Mui-selected`]: {
    color: "#fff",
  },
}));

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const CaptureTitle = styled("div")(({ theme }) => ({
  fontSize: theme.typography.h6.fontSize,
}));

const StoryTitleWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

const StoryTitle = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
  flex: 1,
}));

const StyledIconButton = styled(IconButton)(() => ({
  [`.${svgIconClasses.root}`]: {
    width: 16,
    height: 16,
  },
}));

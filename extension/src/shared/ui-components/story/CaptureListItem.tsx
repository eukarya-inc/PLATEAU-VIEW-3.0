import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { Button, buttonClasses, styled } from "@mui/material";
import { FC, useCallback, useMemo, useRef, useState } from "react";

import { StoryCapture } from "../../layerContainers/story";
import { useCamera } from "../../reearth/hooks";
import { ViewClickAwayListener } from "../common";
import { ViewActionsMenu } from "../common/ViewActionsMenu";

type CaptureListItemProps = {
  capture: StoryCapture;
};

export const CaptureListItem: FC<CaptureListItemProps> = ({ capture }) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { flyTo } = useCamera();

  const viewCapture = useCallback(() => {
    flyTo(capture.camera);
  }, [capture.camera, flyTo]);

  const actions = useMemo(
    () => [
      {
        label: "View",
        onClick: viewCapture,
      },
      {
        label: "Edit",
      },
      {
        label: "Re-Capture",
      },
      {
        label: "Delete",
      },
    ],
    [viewCapture],
  );

  const handleActionsButtonClick = useCallback(() => {
    setActionsOpen(prevOpen => !prevOpen);
  }, []);

  const handleClickAway = useCallback(() => {
    setActionsOpen(false);
  }, []);

  return (
    <ViewClickAwayListener onClickAway={handleClickAway}>
      <Wrapper>
        <ItemHeader>
          <Title>{capture.title}</Title>
          <ActionsButton variant="contained" ref={anchorRef} onClick={handleActionsButtonClick}>
            <MoreVertOutlinedIcon fontSize="small" />
          </ActionsButton>
        </ItemHeader>
        {capture.content && <Content>{capture.content}</Content>}
      </Wrapper>
      <ViewActionsMenu open={actionsOpen} anchorEl={anchorRef.current} actions={actions} />
    </ViewClickAwayListener>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ItemHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
}));

const ActionsButton = styled(Button)(({ theme }) => ({
  [`&.${buttonClasses.root}`]: {
    height: "28px",
    width: "28px",
    minWidth: "28px",
    padding: theme.spacing(0),
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "none",
  },
}));

const Content = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

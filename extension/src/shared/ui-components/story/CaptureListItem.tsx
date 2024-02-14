import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { Button, buttonClasses, styled } from "@mui/material";
import { FC } from "react";

import { StoryCapture } from "../../layerContainers/story";

type CaptureListItemProps = {
  capture: StoryCapture;
};

export const CaptureListItem: FC<CaptureListItemProps> = ({ capture }) => {
  return (
    <Wrapper>
      <ItemHeader>
        <Title>{capture.title}</Title>
        <ActionsButton variant="contained">
          <MoreVertOutlinedIcon fontSize="small" />
        </ActionsButton>
      </ItemHeader>
      <Content>{capture.content}</Content>
    </Wrapper>
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

import { styled } from "@mui/material";
import { FC } from "react";

import { StoryCapture } from "../../layerContainers/story";

import { CaptureListItem } from "./CaptureListItem";

type CaptureListProps = {
  captures: StoryCapture[];
};

export const CaptureList: FC<CaptureListProps> = ({ captures }) => {
  return captures.length > 0 ? (
    <Wrapper>
      {captures.map(capture => (
        <CaptureListItem key={capture.id} capture={capture} />
      ))}
    </Wrapper>
  ) : null;
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 1),
}));

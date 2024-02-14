import { Pagination, paginationItemClasses, styled } from "@mui/material";
import { useAtomValue } from "jotai";
import { FC, useCallback, useState } from "react";
import Markdown from "react-markdown";

import { LayerModel } from "../../layers";
import { STORY_LAYER } from "../../view-layers";

type StoryInspectSectionProps = {
  layer: LayerModel<typeof STORY_LAYER>;
};

export const StoryInspectSection: FC<StoryInspectSectionProps> = ({ layer }) => {
  const captures = useAtomValue(layer.capturesAtom);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);

  const handleChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentCaptureIndex(value - 1);
  }, []);

  return (
    <SectionWrapper>
      {captures.length > 0 ? (
        <>
          <Content>
            <Markdown skipHtml>{captures[currentCaptureIndex].content}</Markdown>
          </Content>
          <PaginationWrapper>
            <StyledPagination
              count={captures.length}
              color="primary"
              size="small"
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              onChange={handleChange}
            />
          </PaginationWrapper>
        </>
      ) : (
        <NoCaptures>No captures.</NoCaptures>
      )}
    </SectionWrapper>
  );
};

const SectionWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 0, 1, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
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
  fontSize: theme.typography.body2.fontSize,
}));

const NoCaptures = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
  padding: theme.spacing(1),
}));

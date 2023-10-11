import { styled, Paper, PaperProps } from "@mui/material";
import { forwardRef } from "react";

import { AutoHeight } from ".";

export type EditorPanelProps = PaperProps;

export const EditorPanel = forwardRef<HTMLDivElement, EditorPanelProps>(({ children }, ref) => (
  <AutoHeight>
    <StyledPaper ref={ref}>{children}</StyledPaper>
  </AutoHeight>
));

export type EditorSectionProps = {
  sidebar: React.ReactNode;
  main: React.ReactNode;
};

export const EditorSection: React.FC<EditorSectionProps> = ({ sidebar, main }) => {
  return (
    <ContentWrapper>
      <Sidebar>{sidebar}</Sidebar>
      <Main>{main}</Main>
    </ContentWrapper>
  );
};

const StyledPaper = styled(Paper)(({ theme, elevation = 4 }) => ({
  position: "relative",
  maxHeight: "100%",
  boxShadow: theme.shadows[elevation],
  pointerEvents: "auto",
  margin: "6px 6px 0 0",
}));

const ContentWrapper = styled("div")({
  width: "577px",
  maxHeight: "573px",
  display: "flex",
});

const Sidebar = styled("div")({
  width: "199px",
  height: "100%",
});

const Main = styled("div")({
  height: "573px",
  display: "flex",
  flex: 1,
});

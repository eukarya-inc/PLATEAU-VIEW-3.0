import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { styled, Paper, PaperProps, Button } from "@mui/material";
import { forwardRef } from "react";

import { AutoHeight } from "../";

export type EditorPanelProps = PaperProps;

export const EditorPanel = forwardRef<HTMLDivElement, EditorPanelProps>(({ children }, ref) => (
  <AutoHeight>
    <StyledPaper ref={ref}>{children}</StyledPaper>
  </AutoHeight>
));

export type EditorSectionProps = {
  sidebarMain: React.ReactNode;
  sidebarBottom?: React.ReactNode;
  main: React.ReactNode;
  header?: React.ReactNode;
  showSaveButton?: boolean;
  onSave?: () => void;
};

export const EditorSection: React.FC<EditorSectionProps> = ({
  sidebarMain,
  sidebarBottom,
  main,
  header,
  showSaveButton,
  onSave,
}) => {
  return (
    <ContentWrapper>
      <Sidebar>
        <SidebarMain>{sidebarMain}</SidebarMain>
        {sidebarBottom ? <SidebarBottom>{sidebarBottom}</SidebarBottom> : null}
      </Sidebar>
      <Main>
        {header && <SectionHeader>{header}</SectionHeader>}
        <SectionContent>{main}</SectionContent>
        {showSaveButton && (
          <SectionAction>
            <StyledButton
              startIcon={<SaveOutlinedIcon />}
              variant="contained"
              color="primary"
              onClick={onSave}>
              Save
            </StyledButton>
          </SectionAction>
        )}
      </Main>
    </ContentWrapper>
  );
};

const StyledPaper = styled(Paper)(({ theme, elevation = 4 }) => ({
  position: "relative",
  maxHeight: "100%",
  boxShadow: theme.shadows[elevation],
  pointerEvents: "auto",
  margin: "6px 6px 0 0",
  overflow: "hidden",
}));

const ContentWrapper = styled("div")({
  width: "577px",
  height: "573px",
  display: "flex",
  alignItems: "stretch",
  [`*`]: {
    boxSizing: "border-box",
  },
});

const Sidebar = styled("div")({
  width: "199px",
  height: "100%",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
});

const SidebarMain = styled("div")({
  height: "100%",
  flex: 1,
});

const SidebarBottom = styled("div")({
  flexGrow: 0,
  height: "auto",
});

const Main = styled("div")(({ theme }) => ({
  height: "573px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  backgroundColor: theme.palette.grey[300],
  maxWidth: "377px",
}));

const SectionHeader = styled("div")(({ theme }) => ({
  height: "38px",
  backgroundColor: theme.palette.background.paper,
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  flexShrink: 0,
}));

const SectionContent = styled("div")(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "8px",
  fontSize: theme.typography.body2.fontSize,
}));

const SectionAction = styled("div")(({ theme }) => ({
  height: "48px",
  backgroundColor: theme.palette.background.paper,
  borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
}));

const StyledButton = styled(Button)(() => ({
  width: "100%",
  color: "#fff",
  height: "32px",
}));

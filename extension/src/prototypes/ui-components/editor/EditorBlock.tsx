import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { styled } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { useState, useCallback } from "react";

export type EditorBlockProps = {
  title?: string;
  expandable?: boolean;
  expanded?: boolean;
  children?: React.ReactNode;
};

export const EditorBlock: React.FC<EditorBlockProps> = ({
  title,
  expandable,
  expanded,
  children,
}) => {
  const [localExpaned, setExpanded] = useState(expanded === undefined ? true : expanded);

  const handleTitleClick = useCallback(() => {
    if (!expandable) return;
    setExpanded(!localExpaned);
  }, [expandable, localExpaned]);

  return (
    <BlockWrapper>
      <BlockHeader>
        <BlockTitle expandable={!!expandable} onClick={handleTitleClick}>
          {expandable && <StyledIcon expanded={localExpaned ? 1 : 0} />}
          {title}
        </BlockTitle>
      </BlockHeader>
      <Collapse in={localExpaned || !expandable}>
        <BlockContent>{children}</BlockContent>
      </Collapse>
    </BlockWrapper>
  );
};

const BlockWrapper = styled("div")({});

const BlockHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  height: "34px",
  backgroundColor: theme.palette.background.paper,
}));

const BlockTitle = styled("div")<{ expandable: boolean }>(({ expandable }) => ({
  display: "flex",
  alignItems: "center",
  cursor: expandable ? "pointer" : "default",
  padding: expandable ? "0 8px 0 4px" : "0 8px",
}));

const StyledIcon = styled(ArrowRightIcon)<{ expanded: number }>(({ expanded }) => ({
  display: "flex",
  alignItems: "center",
  width: "24px",
  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease-in-out",
}));

const BlockContent = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  backgroundColor: theme.palette.grey[100],
  padding: "8px",
}));

export const BlockContentWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "4px",
}));

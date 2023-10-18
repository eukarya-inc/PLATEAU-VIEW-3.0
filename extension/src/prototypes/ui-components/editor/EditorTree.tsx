import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import {
  ListItemIcon,
  styled,
  listItemIconClasses,
  listItemTextClasses,
  svgIconClasses,
  typographyClasses,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useCallback, useMemo } from "react";

export type EditorTreeItem = {
  id: string;
  name: string;
  property?: any;
  children?: EditorTreeItem[];
};

export type EditorTreeSelection = { id: string } & EditorTreeItem["property"];

type EditorTreeItemProps = {
  item: EditorTreeItem;
  level: number;
  selected?: string;
  expanded: string[];
  onItemClick?: (selection: EditorTreeSelection) => void;
  onExpandClick?: (id: string) => void;
};

export type EditorTreeProps = {
  tree: EditorTreeItem[];
  selected?: string;
  expanded: string[];
  ready?: boolean;
  onItemClick?: (selection: EditorTreeSelection) => void;
  onExpandClick?: (id: string) => void;
};

const EditorTreeItem: React.FC<EditorTreeItemProps> = ({
  item,
  level,
  selected,
  expanded,
  onItemClick,
  onExpandClick,
}) => {
  const localSelected = useMemo(() => selected === item.id, [selected, item.id]);
  const localExpanded = useMemo(() => expanded.includes(item.id), [expanded, item.id]);

  const handleClick = useCallback(() => {
    onItemClick?.({ id: item.id, ...item.property });
  }, [onItemClick, item]);

  const handleOpen = useCallback(() => {
    onExpandClick?.(item.id);
  }, [item, onExpandClick]);

  return (
    <>
      <StyledItemButton
        onClick={handleClick}
        level={level}
        selected={localSelected}
        expanded={localExpanded}>
        <ListItemIcon onClick={handleOpen}>
          {item.children ? <ArrowRightIcon /> : null}
        </ListItemIcon>
        <ListItemText primary={item.name} />
      </StyledItemButton>
      {item.children ? (
        <Collapse in={localExpanded}>
          <StyledList>
            {item.children.map(child => (
              <EditorTreeItem
                key={child.id}
                item={child}
                level={level + 1}
                selected={selected}
                expanded={expanded}
                onItemClick={onItemClick}
                onExpandClick={onExpandClick}
              />
            ))}
          </StyledList>
        </Collapse>
      ) : null}
    </>
  );
};

export const EditorTree: React.FC<EditorTreeProps> = ({
  tree,
  selected,
  expanded,
  ready,
  onItemClick,
  onExpandClick,
}) => {
  return ready ? (
    <TreeWrapper>
      <StyledList>
        {tree.map(item => (
          <EditorTreeItem
            key={item.id}
            item={item}
            level={0}
            selected={selected}
            expanded={expanded}
            onItemClick={onItemClick}
            onExpandClick={onExpandClick}
          />
        ))}
      </StyledList>
    </TreeWrapper>
  ) : null;
};

const TreeWrapper = styled("div")({
  padding: "8px",
});

const StyledList = styled(List)(() => ({
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}));

const StyledItemButton = styled(ListItemButton, {
  shouldForwardProp: props => props !== "expanded",
})<{
  level: number;
  selected: boolean;
  expanded: boolean;
}>(({ theme, level, selected, expanded }) => ({
  paddingLeft: theme.spacing(0.5 + level),
  paddingRight: 0,
  color: selected ? "#fff" : theme.palette.text.primary,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderRadius: "4px",
  height: "auto",

  [`.${listItemIconClasses.root}`]: {
    minWidth: "20px",
    height: "18px",
  },

  [`.${listItemTextClasses.root}`]: {
    margin: 0,
  },

  [`.${svgIconClasses.root}`]: {
    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease-in-out",
    color: selected ? "#fff" : theme.palette.text.primary,
    width: "18px",
    height: "18px",
  },

  [`.${typographyClasses.root}`]: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: "1.45",
  },
}));

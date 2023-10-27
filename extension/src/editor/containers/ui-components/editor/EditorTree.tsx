import { styled } from "@mui/material";
import List from "@mui/material/List";

import { EditorTreeItem, EditorTreeItemType, EditorTreeSelection } from "./EditorTreeItem";

export type EditorTreeProps = {
  tree: EditorTreeItemType[];
  selected?: string;
  expanded: string[];
  ready?: boolean;
  clickFolderToExpand?: boolean;
  onItemClick?: (selection: EditorTreeSelection) => void;
  onExpandClick?: (id: string) => void;
};

export const EditorTree: React.FC<EditorTreeProps> = ({
  tree,
  selected,
  expanded,
  ready,
  clickFolderToExpand,
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
            level={item.id === "root" ? -1 : 0}
            selected={selected}
            expanded={expanded}
            clickFolderToExpand={clickFolderToExpand}
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

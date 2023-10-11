import { TreeView, type TreeViewProps } from "@mui/lab";
import { styled } from "@mui/material";
import { type FC } from "react";

import { TreeArrowCollapsedIcon, TreeArrowExpandedIcon } from "./icons";

const StyledTreeView = styled(TreeView)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export type EditorTreeViewProps = TreeViewProps;

export const EditorTreeView: FC<EditorTreeViewProps> = props => (
  <StyledTreeView
    defaultCollapseIcon={<TreeArrowExpandedIcon />}
    defaultExpandIcon={<TreeArrowCollapsedIcon />}
    {...props}
  />
);

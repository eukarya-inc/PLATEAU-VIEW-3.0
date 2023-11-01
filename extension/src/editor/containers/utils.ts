import { ComponentTemplate, EmphasisPropertyTemplate } from "../../shared/api/types";

import { EditorTreeItemType } from "./ui-components";

export const VIRTUAL_ROOT = {
  id: "__root__",
  name: "Root",
};

export const convertTemplatesToTree = (
  templates: ComponentTemplate[] | EmphasisPropertyTemplate[],
) => {
  if (!templates) return [];

  const tree: EditorTreeItemType[] = [];
  templates.forEach(template => {
    if (!template.name) return;
    const paths = template.name.split("/");
    const item = {
      id: template.id,
      name: paths[paths.length - 1],
      property: {
        templateId: template.id,
      },
    };

    if (paths.length === 1) {
      tree.push(item);
      return;
    }

    const parent = findOrCreateParent(tree, paths.slice(0, paths.length - 1).join("/"));
    if (!parent.children) parent.children = [];
    parent.children.push(item);
  });

  const treeWithRoot: EditorTreeItemType[] = [{ ...VIRTUAL_ROOT, children: tree }];

  return treeWithRoot;
};

const findOrCreateParent: (tree: EditorTreeItemType[], path: string) => EditorTreeItemType = (
  tree,
  path,
) => {
  let parent: EditorTreeItemType;
  const paths = path.split("/");
  const existParent = tree.find(t => t.name === paths[0]);
  if (existParent) {
    parent = existParent;
  } else {
    const newParent = {
      id: paths[0],
      name: paths[0],
    };
    tree.push(newParent);
    parent = newParent;
  }
  if (!parent.children) parent.children = [];
  if (paths.length === 1) return parent;
  return findOrCreateParent(parent.children, paths.slice(1).join("/"));
};

export function generateID() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
}

export function getSelectedPath(tree: EditorTreeItemType[], selectedId: string): string[] {
  for (let i = 0; i < tree.length; i++) {
    const path = findPath(tree[i], selectedId, "");
    if (path) return path.split("/");
  }
  return [];
}

const findPath = (
  branch: EditorTreeItemType,
  selectedId: string,
  path: string,
): string | undefined => {
  const currentPath =
    branch.id === VIRTUAL_ROOT.id ? "" : path ? `${path}/${branch.name}` : branch.name;
  if (branch.id === selectedId) {
    return currentPath;
  }
  if (branch.children) {
    for (let i = 0; i < branch.children.length; i++) {
      const path = findPath(branch.children[i], selectedId, currentPath);
      if (path) {
        return path;
      }
    }
  }
  return undefined;
};

import { ComponentTemplate, EmphasisPropertyTemplate } from "../../shared/api/types";

import { EditorTreeItemType } from "./ui-components";

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

  return tree;
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

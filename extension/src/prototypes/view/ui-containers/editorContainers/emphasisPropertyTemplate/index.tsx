import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback } from "react";

import { useTemplateAPI } from "../../../../../shared/api";
import { EditorSection, EditorTree, EditorTreeSelection } from "../../../../ui-components";
import { convertTemplatesToTree } from "../utils";

import { EmphasisPropertyTemplatePage } from "./emphasisPropertyTemplatePage";

export type EditorEmphasisPropertyTemplateContentType = "folder" | "template" | "empty";
export type EditorEmphasisPropertyTemplateItemProperty = {
  templateId?: string;
};

export const EditorInspectorEmphasisPropertyTemplateSection: React.FC = () => {
  const [contentType, setContentType] =
    useState<EditorEmphasisPropertyTemplateContentType>("empty");
  const [templateId, setTemplateId] = useState<string>();

  const { emphasisPropertyTemplatesAtom } = useTemplateAPI();
  const emphasisPropertyTemplates = useAtomValue(emphasisPropertyTemplatesAtom);

  const templatesTree = useMemo(
    () => convertTemplatesToTree(emphasisPropertyTemplates),
    [emphasisPropertyTemplates],
  );

  const template = useMemo(
    () => emphasisPropertyTemplates.find(c => c.id === templateId),
    [emphasisPropertyTemplates, templateId],
  );

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");

  const handleItemClick = useCallback(({ id, templateId }: EditorTreeSelection) => {
    setSelected(id);
    setContentType(templateId ? "template" : "folder");
    setTemplateId(templateId);
  }, []);

  const handleExpandClick = useCallback(
    (id: string) => {
      if (expanded.includes(id)) {
        setExpanded(expanded.filter(e => e !== id));
      } else {
        setExpanded([...expanded, id]);
      }
    },
    [expanded],
  );

  return (
    <EditorSection
      sidebarMain={
        <EditorTree
          tree={templatesTree}
          selected={selected}
          expanded={expanded}
          ready={!!templatesTree}
          onItemClick={handleItemClick}
          onExpandClick={handleExpandClick}
        />
      }
      main={
        contentType === "template" ? <EmphasisPropertyTemplatePage template={template} /> : null
      }
      header={template?.name}
    />
  );
};

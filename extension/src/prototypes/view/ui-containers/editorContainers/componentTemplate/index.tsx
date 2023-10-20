import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback } from "react";

import { useTemplateAPI } from "../../../../../shared/api";
import { EditorSection, EditorTree, EditorTreeSelection } from "../../../../ui-components";
import { convertTemplatesToTree } from "../utils";

import { ComponentTemplatePage } from "./ComponentTemplatePage";

export type EditorFieldComponentsTemplateContentType = "folder" | "template" | "empty";
export type EditorFieldComponentsTemplateItemProperty = {
  templateId?: string;
};

export const EditorFieldComponentsTemplateSection: React.FC = () => {
  const [contentType, setContentType] = useState<EditorFieldComponentsTemplateContentType>("empty");
  const [templateId, setTemplateId] = useState<string>();

  const { componentTemplatesAtom } = useTemplateAPI();
  const componentTemplates = useAtomValue(componentTemplatesAtom);

  const templatesTree = useMemo(
    () => convertTemplatesToTree(componentTemplates),
    [componentTemplates],
  );

  const template = useMemo(
    () => componentTemplates.find(c => c.id === templateId),
    [componentTemplates, templateId],
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

  const showSaveButton = useMemo(() => contentType === "template", [contentType]);

  const handleSave = useCallback(() => {
    console.log("field component template save");
  }, []);

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
      main={contentType === "template" ? <ComponentTemplatePage template={template} /> : null}
      header={template?.name}
      showSaveButton={showSaveButton}
      onSave={handleSave}
    />
  );
};

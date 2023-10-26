import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback, useEffect } from "react";

import { EditorSection, EditorTree, EditorTreeSelection } from "../../../prototypes/ui-components";
import { useTemplateAPI } from "../../../shared/api";
import { EmphasisPropertyTemplate } from "../../../shared/api/types";
import { convertTemplatesToTree } from "../utils";

import { EmphasisPropertyTemplatePage } from "./emphasisPropertyTemplatePage";

export type EditorEmphasisPropertyTemplateContentType = "folder" | "template" | "empty";
export type EditorEmphasisPropertyTemplateItemProperty = {
  templateId?: string;
};

export type UpdateTemplate = React.Dispatch<
  React.SetStateAction<EmphasisPropertyTemplate | undefined>
>;

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

  const [template, updateTemplate] = useState<EmphasisPropertyTemplate | undefined>();

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

  useEffect(() => {
    updateTemplate(emphasisPropertyTemplates.find(c => c.id === templateId));
  }, [emphasisPropertyTemplates, templateId]);

  const handleSave = useCallback(() => {
    console.log("TODO: emphasis property template save", template);
  }, [template]);

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
        contentType === "template" && template ? (
          <EmphasisPropertyTemplatePage template={template} updateTemplate={updateTemplate} />
        ) : null
      }
      header={template?.name}
      showSaveButton={showSaveButton}
      onSave={handleSave}
    />
  );
};

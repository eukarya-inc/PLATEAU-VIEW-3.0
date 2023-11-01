import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback, useEffect } from "react";

import { useTemplateAPI } from "../../../shared/api";
import { EmphasisPropertyTemplate } from "../../../shared/api/types";
import { TemplateAddButton } from "../common/commonTemplate/TemplateAddButton";
import { TemplateHeader } from "../common/commonTemplate/TemplateHeader";
import { EditorSection, EditorTree, EditorTreeSelection } from "../ui-components";
import { VIRTUAL_ROOT, convertTemplatesToTree, getSelectedPath } from "../utils";

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

  const { templatesAtom, saveTemplate, removeTemplate } = useTemplateAPI();
  const templates = useAtomValue(templatesAtom);

  const emphasisPropertyTemplates = useMemo(
    () =>
      templates
        ? (templates?.filter(t => t.type === "emphasis") as EmphasisPropertyTemplate[])
        : [],
    [templates],
  );

  const templatesTree = useMemo(
    () => convertTemplatesToTree(emphasisPropertyTemplates),
    [emphasisPropertyTemplates],
  );

  const [template, updateTemplate] = useState<EmphasisPropertyTemplate | undefined>();

  const [expanded, setExpanded] = useState<string[]>([VIRTUAL_ROOT.id]);
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

  const templateNames = useMemo(
    () => emphasisPropertyTemplates.map(t => t.name),
    [emphasisPropertyTemplates],
  );
  const base = useMemo(() => {
    const paths = getSelectedPath(templatesTree, selected);
    if (contentType === "template") paths.splice(-1, 1);
    const fullPath = paths.join("/");
    return fullPath === "" ? "" : `${fullPath}/`;
  }, [templatesTree, selected, contentType]);

  const handleTemplateAdd = useCallback(
    async (newTemplateName: string) => {
      await saveTemplate({
        name: newTemplateName,
        type: "emphasis",
        properties: [],
      } as unknown as EmphasisPropertyTemplate);
    },
    [saveTemplate],
  );

  const handleTemplateSave = useCallback(async () => {
    if (!template) return;
    await saveTemplate(template);
  }, [template, saveTemplate]);

  const handleTemplateRename = useCallback(
    async (newTemplateName: string) => {
      if (!template) return;
      await saveTemplate({
        ...template,
        name: newTemplateName,
      });
    },
    [template, saveTemplate],
  );

  const handleTemplateRemove = useCallback(
    async (templateId: string) => {
      if (!templateId) return;
      await removeTemplate(templateId);
    },
    [removeTemplate],
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
      sidebarBottom={
        <TemplateAddButton
          templateNames={templateNames}
          base={base}
          onTemplateAdd={handleTemplateAdd}
        />
      }
      main={
        contentType === "template" &&
        template && (
          <EmphasisPropertyTemplatePage template={template} updateTemplate={updateTemplate} />
        )
      }
      header={
        contentType === "template" &&
        template && (
          <TemplateHeader
            templateId={template.id}
            templateName={template?.name}
            templateNames={templateNames}
            onTemplateRename={handleTemplateRename}
            onTemplateRemove={handleTemplateRemove}
          />
        )
      }
      showSaveButton={showSaveButton}
      onSave={handleTemplateSave}
    />
  );
};

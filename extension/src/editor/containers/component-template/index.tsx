import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback, useEffect } from "react";

import { useTemplateAPI } from "../../../shared/api";
import { ComponentTemplate } from "../../../shared/api/types";
import { TemplateAddButton } from "../common/commonTemplate/TemplateAddButton";
import { TemplateHeader } from "../common/commonTemplate/TemplateHeader";
import { EditorSection, EditorTree, EditorTreeSelection } from "../ui-components";
import { VIRTUAL_ROOT, convertTemplatesToTree, generateID, getSelectedPath } from "../utils";

import { ComponentTemplatePage } from "./ComponentTemplatePage";

export type EditorFieldComponentsTemplateContentType = "folder" | "template" | "empty";
export type EditorFieldComponentsTemplateItemProperty = {
  templateId?: string;
};

export type UpdateTemplate = React.Dispatch<React.SetStateAction<ComponentTemplate | undefined>>;

export const EditorFieldComponentsTemplateSection: React.FC = () => {
  const [contentType, setContentType] = useState<EditorFieldComponentsTemplateContentType>("empty");
  const [templateId, setTemplateId] = useState<string>();

  const { templatesAtom, saveTemplate, removeTemplate } = useTemplateAPI();
  const templates = useAtomValue(templatesAtom);

  const componentTemplates = useMemo(
    () =>
      templates ? (templates?.filter(t => t.type === "component") as ComponentTemplate[]) : [],
    [templates],
  );

  const templatesTree = useMemo(
    () => convertTemplatesToTree(componentTemplates),
    [componentTemplates],
  );

  const [template, updateTemplate] = useState<ComponentTemplate | undefined>();

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
    updateTemplate(componentTemplates.find(c => c.id === templateId));
  }, [componentTemplates, templateId]);

  useEffect(() => {
    if (!template) return;
    if (!template.groups || template.groups.length === 0) {
      updateTemplate({
        ...template,
        groups: [
          {
            id: generateID(),
            name: "Default",
            components: [],
          },
        ],
      });
    }
  }, [template]);

  const templateNames = useMemo(() => componentTemplates.map(t => t.name), [componentTemplates]);
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
        type: "component",
        groups: [],
      } as unknown as ComponentTemplate);
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
        template && <ComponentTemplatePage template={template} updateTemplate={updateTemplate} />
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

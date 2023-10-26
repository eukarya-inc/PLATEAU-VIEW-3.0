import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback, useEffect } from "react";

import { EditorSection, EditorTree, EditorTreeSelection } from "../../../prototypes/ui-components";
import { useTemplateAPI } from "../../../shared/api";
import { ComponentTemplate } from "../../../shared/api/types";
import { convertTemplatesToTree, generateID } from "../utils";

import { ComponentTemplatePage } from "./ComponentTemplatePage";

export type EditorFieldComponentsTemplateContentType = "folder" | "template" | "empty";
export type EditorFieldComponentsTemplateItemProperty = {
  templateId?: string;
};

export type UpdateTemplate = React.Dispatch<React.SetStateAction<ComponentTemplate | undefined>>;

export const EditorFieldComponentsTemplateSection: React.FC = () => {
  const [contentType, setContentType] = useState<EditorFieldComponentsTemplateContentType>("empty");
  const [templateId, setTemplateId] = useState<string>();

  const { componentTemplatesAtom } = useTemplateAPI();
  const componentTemplates = useAtomValue(componentTemplatesAtom);

  const templatesTree = useMemo(
    () => convertTemplatesToTree(componentTemplates),
    [componentTemplates],
  );

  const [template, updateTemplate] = useState<ComponentTemplate | undefined>();

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

  const handleSave = useCallback(() => {
    console.log("TODO: field component template save", template);
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
          <ComponentTemplatePage template={template} updateTemplate={updateTemplate} />
        ) : null
      }
      header={template?.name}
      showSaveButton={showSaveButton}
      onSave={handleSave}
    />
  );
};

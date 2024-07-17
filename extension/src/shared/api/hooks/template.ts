import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { useIsCityProject } from "../../states/environmentVariables";
import {
  templatesAtom,
  updateTemplateAtom,
  addTemplateAtom,
  removeTemplateByIdAtom,
} from "../../states/template";
import { Template } from "../types";

import { useTemplateClient } from "./useTemplateClient";

export default () => {
  const client = useTemplateClient();
  const [isSaving, setIsSaving] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const templatesFromAtom = useAtomValue(templatesAtom);
  const [isCityProject] = useIsCityProject();
  useEffect(() => {
    if (isCityProject) {
      client.findAllForCity().then(data => {
        setTemplates(data ?? []);
      });
    } else {
      setTemplates(templatesFromAtom);
    }
  }, [templatesFromAtom, isCityProject, client]);

  const updateTemplate = useSetAtom(updateTemplateAtom);
  const addTemplate = useSetAtom(addTemplateAtom);
  const saveTemplate = useCallback(
    async (template: Template) => {
      setIsSaving(true);
      const isUpdate = !!template.id;
      const nextTemplate = await (async () => {
        if (isUpdate) {
          return await client.update(template.id, template);
        } else {
          return await client.save(template);
        }
      })();

      if (isUpdate) {
        setTemplates(p => p.map(v => (v.id === nextTemplate.id ? nextTemplate : v)));
        updateTemplate(nextTemplate);
      } else {
        setTemplates(p => [...p, nextTemplate]);
        addTemplate(nextTemplate);
      }

      setIsSaving(false);
    },
    [client, updateTemplate, addTemplate],
  );

  const removeTemplateById = useSetAtom(removeTemplateByIdAtom);
  const removeTemplate = useCallback(
    async (templateId: string) => {
      if (!templateId) return;
      await client.delete(templateId);

      setTemplates(p => p.filter(v => v.id !== templateId));
      removeTemplateById(templateId);
    },
    [client, removeTemplateById],
  );

  return {
    isSaving,
    templates,
    saveTemplate,
    removeTemplate,
  };
};

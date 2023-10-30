import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";

import { templatesAtom, updateTemplateAtom } from "../../states/template";
import { Template } from "../types";

import { useTemplateClient } from "./useTemplateClient";

export default () => {
  const client = useTemplateClient();
  const [isSaving, setIsSaving] = useState(false);

  const updateTemplate = useSetAtom(updateTemplateAtom);
  const saveTemplate = useCallback(
    async (template: Template) => {
      setIsSaving(true);
      const nextTemplate = await (async () => {
        if (template.id) {
          return await client.update(template.id, template);
        } else {
          return await client.save(template);
        }
      })();

      updateTemplate(nextTemplate);

      setIsSaving(false);
    },
    [client, updateTemplate],
  );

  const setTemplates = useSetAtom(templatesAtom);
  const refetchTemplates = useCallback(async () => {
    const fetch = async () => {
      const templates = await client.findAll();
      console.log(templates);
      setTemplates(Array.isArray(templates) ? templates : []);
    };
    fetch();
  }, [client, setTemplates]);

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (!templateId) return;
      await client.delete(templateId);
      refetchTemplates();
    },
    [client, refetchTemplates],
  );

  return {
    isSaving,
    templatesAtom,
    refetchTemplates,
    saveTemplate,
    deleteTemplate,
  };
};

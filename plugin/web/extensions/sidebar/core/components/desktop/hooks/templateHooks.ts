import { postMsg, processComponentsToSave } from "@web/extensions/sidebar/utils";
import { useCallback, useState } from "react";

import { Template } from "../../../types";

export default ({
  backendURL: plateauBackendURL,
  backendProjectName: plateuProjectName,
  backendAccessToken: plateauAccessToken,
  isCustomProject,
  customBackendURL,
  customBackendProjectName,
  customBackendAccessToken,
  setLoading,
}: {
  backendURL?: string;
  backendProjectName?: string;
  backendAccessToken?: string;
  isCustomProject: boolean;
  customBackendURL?: string;
  customBackendProjectName?: string;
  customBackendAccessToken?: string;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [fieldTemplates, setFieldTemplates] = useState<Template[]>([]);

  const [updatedTemplateIDs, setUpdatedTemplateIDs] = useState<string[]>();

  const getTargetBackend = useCallback(
    (isCustom: boolean) => {
      return {
        backendURL: isCustom ? customBackendURL : plateauBackendURL,
        backendProjectName: isCustom ? customBackendProjectName : plateuProjectName,
        backendAccessToken: isCustom ? customBackendAccessToken : plateauAccessToken,
      };
    },
    [
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
    ],
  );

  const handleTemplateAdd = useCallback(async () => {
    if (
      (!isCustomProject && (!plateauBackendURL || !plateuProjectName || !plateauAccessToken)) ||
      (isCustomProject &&
        (!customBackendURL || !customBackendProjectName || !customBackendAccessToken))
    )
      return;
    const dataSource = isCustomProject ? "custom" : "plateau";
    const { backendURL, backendProjectName, backendAccessToken } =
      getTargetBackend(isCustomProject);
    const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`, {
      headers: {
        authorization: `Bearer ${backendAccessToken}`,
      },
      method: "POST",
      body: JSON.stringify({ type: "field", name: "新しいテンプレート" }),
    });
    if (res.status !== 200) return;
    const newTemplate = await res.json();
    const newTemplateWithDataSource = { ...newTemplate, dataSource };
    setFieldTemplates(t => [...t, newTemplateWithDataSource]);
    return newTemplateWithDataSource as Template;
  }, [
    isCustomProject,
    plateauBackendURL,
    plateuProjectName,
    plateauAccessToken,
    customBackendURL,
    customBackendProjectName,
    customBackendAccessToken,
    getTargetBackend,
  ]);

  const handleTemplateSave = useCallback(
    async (template: Template) => {
      if (
        (template.dataSource !== "custom" &&
          (!plateauBackendURL || !plateuProjectName || !plateauAccessToken)) ||
        (template.dataSource === "custom" &&
          (!customBackendURL || !customBackendProjectName || !customBackendAccessToken))
      )
        return;
      setLoading?.(true);

      const { backendURL, backendProjectName, backendAccessToken } = getTargetBackend(
        template.dataSource === "custom",
      );
      const templateToSave = convertForSave(template, fieldTemplates);

      const res = await fetch(
        `${backendURL}/sidebar/${backendProjectName}/templates/${template.id}`,
        {
          headers: {
            authorization: `Bearer ${backendAccessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify(templateToSave),
        },
      );
      if (res.status !== 200) return;
      const updatedTemplate = await res.json();
      setUpdatedTemplateIDs(ids => [...(ids ?? []), updatedTemplate.id]);
      setFieldTemplates(t => {
        return t.map(t2 => {
          if (t2.id === updatedTemplate.id) {
            return { ...updatedTemplate, dataSource: template.dataSource };
          }
          return t2;
        });
      });
      setLoading?.(false);
    },
    [
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
      fieldTemplates,
      setLoading,
      getTargetBackend,
    ],
  );

  const handleTemplateRemove = useCallback(
    async (id: string) => {
      const template = fieldTemplates.find(t => t.id === id);
      if (
        !template ||
        (template.dataSource !== "custom" &&
          (!plateauBackendURL || !plateuProjectName || !plateauAccessToken)) ||
        (template.dataSource === "custom" &&
          (!customBackendURL || !customBackendProjectName || !customBackendAccessToken))
      )
        return;

      const { backendURL, backendProjectName, backendAccessToken } = getTargetBackend(
        template.dataSource === "custom",
      );

      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates/${id}`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "DELETE",
      });
      if (res.status !== 200 && res.status !== 204) return;
      setFieldTemplates(t => t.filter(t2 => t2.id !== id));
    },
    [
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
      fieldTemplates,
      getTargetBackend,
    ],
  );

  const [infoboxTemplates, setInfoboxTemplates] = useState<Template[]>([]);

  const handleInfoboxTemplateAdd = useCallback(
    async (template: Omit<Template, "id">) => {
      if (
        (!isCustomProject && (!plateauBackendURL || !plateuProjectName || !plateauAccessToken)) ||
        (isCustomProject &&
          (!customBackendURL || !customBackendProjectName || !customBackendAccessToken))
      )
        return;
      const dataSource = isCustomProject ? "custom" : "plateau";

      const { backendURL, backendProjectName, backendAccessToken } = getTargetBackend(
        template.dataSource === "custom",
      );

      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "POST",
        body: JSON.stringify(template),
      });
      if (res.status !== 200) return;
      const newTemplate = await res.json();
      setInfoboxTemplates(t => [...t, { ...newTemplate, dataSource }]);
      postMsg({
        action: "infoboxFieldsSaved",
      });
      return newTemplate as Template;
    },
    [
      isCustomProject,
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
      getTargetBackend,
    ],
  );

  const handleInfoboxTemplateSave = useCallback(
    async (template: Template) => {
      if (
        (template.dataSource !== "custom" &&
          (!plateauBackendURL || !plateuProjectName || !plateauAccessToken)) ||
        (template.dataSource === "custom" &&
          (!customBackendURL || !customBackendProjectName || !customBackendAccessToken))
      )
        return;

      const { backendURL, backendProjectName, backendAccessToken } = getTargetBackend(
        template.dataSource === "custom",
      );

      const res = await fetch(
        `${backendURL}/sidebar/${backendProjectName}/templates/${template.id}`,
        {
          headers: {
            authorization: `Bearer ${backendAccessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify(template),
        },
      );
      if (res.status !== 200) return;
      const updatedTemplate = await res.json();
      setInfoboxTemplates(t => {
        return t.map(t2 => {
          if (t2.id === updatedTemplate.id) {
            return { ...updatedTemplate, dataSource: template.dataSource };
          }
          return t2;
        });
      });
      postMsg({
        action: "infoboxFieldsSaved",
      });
    },
    [
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
      getTargetBackend,
    ],
  );

  const handleInfoboxFieldsSave = useCallback(
    async (template: Template) => {
      if (template.id) {
        handleInfoboxTemplateSave(template);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...templateData } = template;
        handleInfoboxTemplateAdd(templateData);
      }
    },
    [handleInfoboxTemplateAdd, handleInfoboxTemplateSave],
  );

  return {
    fieldTemplates,
    infoboxTemplates,
    updatedTemplateIDs,
    setUpdatedTemplateIDs,
    setFieldTemplates,
    setInfoboxTemplates,
    handleTemplateAdd,
    handleTemplateSave,
    handleTemplateRemove,
    handleInfoboxFieldsSave,
  };
};

const convertForSave = (templateToSave: Template, templates: Template[]): Template => {
  const templateForSave = {
    ...templateToSave,
    components: processComponentsToSave(templateToSave.components, templates),
  };
  delete templateForSave.dataSource;
  return templateForSave;
};

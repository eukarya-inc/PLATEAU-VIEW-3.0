import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useRef, useState } from "react";

import { DataCatalogItem, Template } from "../../types";

export default ({
  backendURL,
  backendProjectName,
  backendAccessToken,
  processedCatalog,
  setLoading,
}: {
  backendURL?: string;
  backendProjectName?: string;
  backendAccessToken?: string;
  processedCatalog: DataCatalogItem[];
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [fieldTemplates, setFieldTemplates] = useState<Template[]>([]);

  const handleTemplateAdd = useCallback(async () => {
    if (!backendURL || !backendProjectName || !backendAccessToken) return;
    const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`, {
      headers: {
        authorization: `Bearer ${backendAccessToken}`,
      },
      method: "POST",
      body: JSON.stringify({ type: "field", name: "新しいテンプレート" }),
    });
    if (res.status !== 200) return;
    const newTemplate = await res.json();
    setFieldTemplates(t => [...t, newTemplate]);
    return newTemplate as Template;
  }, [backendURL, backendProjectName, backendAccessToken]);

  const handleTemplateSave = useCallback(
    async (template: Template) => {
      if (!backendURL || !backendProjectName || !backendAccessToken) return;
      setLoading?.(true);
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
      setFieldTemplates(t => {
        return t.map(t2 => {
          if (t2.id === updatedTemplate.id) {
            return updatedTemplate;
          }
          return t2;
        });
      });
      setLoading?.(false);
    },
    [backendURL, backendProjectName, backendAccessToken, setLoading],
  );

  const handleTemplateRemove = useCallback(
    async (id: string) => {
      if (!backendURL || !backendProjectName || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates/${id}`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "DELETE",
      });
      if (res.status !== 200) return;
      setFieldTemplates(t => t.filter(t2 => t2.id !== id));
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  const [infoboxTemplates, setInfoboxTemplates] = useState<Template[]>([]);

  const handleInfoboxTemplateAdd = useCallback(
    async (template: Omit<Template, "id">) => {
      if (!backendURL || !backendProjectName || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "POST",
        body: JSON.stringify(template),
      });
      if (res.status !== 200) return;
      const newTemplate = await res.json();
      setInfoboxTemplates(t => [...t, newTemplate]);
      return newTemplate as Template;
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  const handleInfoboxTemplateSave = useCallback(
    async (template: Template) => {
      if (!backendURL || backendProjectName || !backendAccessToken) return;
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
            return updatedTemplate;
          }
          return t2;
        });
      });
      postMsg({
        action: "infoboxFieldsSaved",
      });
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  const handleInfoboxFieldsFetch = useCallback(
    (dataID: string) => {
      const name = processedCatalog?.find(d => d.dataID === dataID)?.type ?? "";
      const fields = infoboxTemplates.find(ft => ft.type === "infobox" && ft.name === name) ?? {
        id: "",
        type: "infobox",
        name,
        fields: [],
      };
      postMsg({
        action: "infoboxFieldsFetch",
        payload: fields,
      });
    },
    [processedCatalog, infoboxTemplates],
  );
  const handleInfoboxFieldsFetchRef = useRef<any>();
  handleInfoboxFieldsFetchRef.current = handleInfoboxFieldsFetch;

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

  const handleInfoboxFieldsSaveRef = useRef<any>();
  handleInfoboxFieldsSaveRef.current = handleInfoboxFieldsSave;

  return {
    fieldTemplates,
    handleInfoboxFieldsFetchRef,
    handleInfoboxFieldsSaveRef,
    setFieldTemplates,
    setInfoboxTemplates,
    handleTemplateAdd,
    handleTemplateSave,
    handleTemplateRemove,
  };
};

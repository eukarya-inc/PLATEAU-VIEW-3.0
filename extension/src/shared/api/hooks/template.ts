import { atom, useAtom } from "jotai";
import { useCallback } from "react";

// import { DATA_API } from "../../constants";
import { mockFieldComponentTemplates, mockInspectorEmphasisPropertyTemplates } from "../mock";
import { ComponentTemplate, EmphasisPropertyTemplate } from "../types";

const componentTemplatesAtom = atom<ComponentTemplate[]>([]);
const emphasisPropertyTemplatesAtom = atom<EmphasisPropertyTemplate[]>([]);

export default () => {
  const [_componentTemplates, setComponentTemplates] = useAtom(componentTemplatesAtom);
  const [_emphasisPropertyTemplates, setEmphasisPropertyTemplates] = useAtom(
    emphasisPropertyTemplatesAtom,
  );

  const handleTemplateFetch = useCallback(async () => {
    // TODO: use the new settings API
    // const response = await fetch(`${DATA_API}/sidebar/plateauview3/template`);
    // const settings = await response.json();

    setComponentTemplates(mockFieldComponentTemplates);
    setEmphasisPropertyTemplates(mockInspectorEmphasisPropertyTemplates);
  }, [setComponentTemplates, setEmphasisPropertyTemplates]);

  return {
    componentTemplatesAtom,
    emphasisPropertyTemplatesAtom,
    handleTemplateFetch,
  };
};

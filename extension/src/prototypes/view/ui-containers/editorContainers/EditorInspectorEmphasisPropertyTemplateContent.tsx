import { EmphasisPropertyTemplate } from "../../../../shared/api/types";

import { EditorEmphasisPropertyTemplateContentType } from "./EditorInspectorEmphasisPropertyTemplateSection";

export type EditorInspectorEmphasisPropertyTemplateContentProps = {
  type?: EditorEmphasisPropertyTemplateContentType;
  template?: EmphasisPropertyTemplate;
};

export const EditorInspectorEmphasisPropertyTemplateContent: React.FC<
  EditorInspectorEmphasisPropertyTemplateContentProps
> = ({ type, template }) => {
  return (
    <>{type === "template" ? <>{JSON.stringify(template)}</> : type === "folder" ? <></> : null}</>
  );
};

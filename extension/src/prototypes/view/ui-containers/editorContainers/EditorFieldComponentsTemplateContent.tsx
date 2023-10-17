import { ComponentTemplate } from "../../../../shared/api/types";

import { EditorFieldComponentsTemplateContentType } from "./EditorFieldComponentsTemplateSection";

export type EditorFieldComponentsTemplateProps = {
  type?: EditorFieldComponentsTemplateContentType;
  template?: ComponentTemplate;
};

export const EditorFieldComponentsTemplateContent: React.FC<EditorFieldComponentsTemplateProps> = ({
  type,
  template,
}) => {
  return (
    <>{type === "template" ? <>{JSON.stringify(template)}</> : type === "folder" ? <></> : null}</>
  );
};

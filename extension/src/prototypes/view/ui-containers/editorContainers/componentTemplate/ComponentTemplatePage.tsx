import { ComponentTemplate } from "../../../../../shared/api/types";
import { FieldComponentEditor } from "../common/fieldComponentEditor";

type ComponentTemplatePageProps = {
  template: ComponentTemplate | undefined;
};

export const ComponentTemplatePage: React.FC<ComponentTemplatePageProps> = ({ template }) => {
  return <FieldComponentEditor fieldComponentsGroups={template?.groups} />;
};

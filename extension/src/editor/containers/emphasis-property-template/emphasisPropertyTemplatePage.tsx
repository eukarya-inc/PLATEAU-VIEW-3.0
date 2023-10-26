import { EmphasisPropertyTemplate } from "../../../shared/api/types";

type EmphasisPropertyTemplatePageProps = {
  template: EmphasisPropertyTemplate | undefined;
};

export const EmphasisPropertyTemplatePage: React.FC<EmphasisPropertyTemplatePageProps> = ({
  template,
}) => {
  return <>Emphasis Property Template Page {template?.id}</>;
};

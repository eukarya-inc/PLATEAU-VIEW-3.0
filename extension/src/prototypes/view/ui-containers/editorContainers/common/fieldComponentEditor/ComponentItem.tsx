import { SettingComponent } from "../../../../../../shared/api/types";

import { fields } from "./fields";

type ComponentItemProps = {
  component: SettingComponent;
};

export const ComponentItem: React.FC<ComponentItemProps> = ({ component }) => {
  const Field = fields[component.type];
  return <Field.Component />;
};

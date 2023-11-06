import { Switch, SwitchProps } from "@mui/material";

import { PropertyLineWrapper } from "./PropertyWrapper";

export const PropertySwitchField: React.FC<SwitchProps> = ({ ...props }) => {
  return <Switch {...props} />;
};

type PropertySwitchProps = SwitchProps & {
  label: string;
};

export const PropertySwitch: React.FC<PropertySwitchProps> = ({ label, ...props }) => {
  return (
    <PropertyLineWrapper>
      {label}
      <Switch {...props} />
    </PropertyLineWrapper>
  );
};

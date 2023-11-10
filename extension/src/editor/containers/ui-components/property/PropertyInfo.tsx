import { PropertyPlaceHolder } from "./PropertyPlaceHolder";
import { PropertyBox, PropertyWrapper } from "./PropertyWrapper";

export const NO_SETTINGS_FOR_THIS_COMPONNET = "No custom settings for this component";
export const FIELD_COMPONENT_NOT_FOUND = "Field component not found";

export const PropertyNoSettings: React.FC = () => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyPlaceHolder>{NO_SETTINGS_FOR_THIS_COMPONNET}</PropertyPlaceHolder>
      </PropertyBox>
    </PropertyWrapper>
  );
};

export const FieldComponentNotFound: React.FC = () => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyPlaceHolder>{FIELD_COMPONENT_NOT_FOUND}</PropertyPlaceHolder>
      </PropertyBox>
    </PropertyWrapper>
  );
};

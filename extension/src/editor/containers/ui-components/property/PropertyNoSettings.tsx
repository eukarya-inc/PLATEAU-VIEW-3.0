import { NO_SETTINGS_FOR_THIS_COMPONNET, PropertyPlaceHolder } from "./PropertyInfo";
import { PropertyBox, PropertyWrapper } from "./PropertyWrapper";

export const PropertyNoSettings: React.FC = () => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyPlaceHolder>{NO_SETTINGS_FOR_THIS_COMPONNET}</PropertyPlaceHolder>
      </PropertyBox>
    </PropertyWrapper>
  );
};

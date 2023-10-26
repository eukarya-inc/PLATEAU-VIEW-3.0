import { BasicFieldProps } from "..";
import {
  PropertyWrapper,
  PropertyBox,
  PropertyPlaceHolder,
  NO_SETTINGS_FOR_THIS_COMPONNET,
} from "../../../../../../prototypes/ui-components";

export const EditorOpacityField: React.FC<BasicFieldProps<"OPACITY_FIELD">> = () => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyPlaceHolder>{NO_SETTINGS_FOR_THIS_COMPONNET}</PropertyPlaceHolder>
      </PropertyBox>
    </PropertyWrapper>
  );
};

import { BasicFieldProps } from "..";
import { PropertyInfo } from "../../../../ui-components";

export const EditorOpacityField: React.FC<BasicFieldProps<"OPACITY_FIELD">> = () => {
  return (
    <PropertyInfo>
      Attention: This component will override the color settings from Style Code component.
    </PropertyInfo>
  );
};

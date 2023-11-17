import { BasicFieldProps } from "..";
import { PropertyBox, PropertyNoSettings, PropertyWrapper } from "../../../../ui-components";

export const EditorTimelineMonthField: React.FC<BasicFieldProps<"TIMELINE_MONTH_FIELD">> = () => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyNoSettings />
      </PropertyBox>
    </PropertyWrapper>
  );
};

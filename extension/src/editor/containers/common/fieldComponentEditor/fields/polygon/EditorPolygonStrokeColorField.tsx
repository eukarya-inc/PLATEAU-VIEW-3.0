import { useCallback } from "react";

import { BasicFieldProps } from "..";
import { PropertyBox, PropertyColorField, PropertyWrapper } from "../../../../ui-components";

export const EditorPolygonStrokeColorField: React.FC<
  BasicFieldProps<"POLYGON_STROKE_COLOR_FIELD">
> = ({ component, onUpdate }) => {
  const handleColorChange = useCallback(
    (color: string) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          defaultValue: color,
        },
      });
    },
    [component, onUpdate],
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyColorField
          value={component.preset?.defaultValue ?? ""}
          onChange={handleColorChange}
        />
      </PropertyBox>
    </PropertyWrapper>
  );
};

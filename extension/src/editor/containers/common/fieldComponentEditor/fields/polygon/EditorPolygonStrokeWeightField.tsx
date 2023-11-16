import { InputAdornment } from "@mui/material";
import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";

export const EditorPolygonStrokeWeightField: React.FC<
  BasicFieldProps<"POLYGON_STROKE_WEIGHT_FIELD">
> = ({ component, onUpdate }) => {
  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numberSize = Number(e.target.value);
      if (isNaN(numberSize)) return;
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          defaultValue: numberSize,
        },
      });
    },
    [component, onUpdate],
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Stroke Weight">
          <PropertyInputField
            placeholder="Value"
            value={component.preset?.defaultValue ?? ""}
            onChange={handleSizeChange}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};

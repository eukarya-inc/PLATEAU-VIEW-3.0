import { InputAdornment } from "@mui/material";
import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
} from "../../../../ui-components";

export const EditorPointImageSizeField: React.FC<BasicFieldProps<"POINT_IMAGE_SIZE_FIELD">> = ({
  component,
  onUpdate,
}) => {
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

  const handleEnableSizeInMetersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          enableSizeInMeters: !!e.target.checked,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertySwitch
          label="Enable SizeInMeters"
          checked={!!component.preset?.enableSizeInMeters}
          onChange={handleEnableSizeInMetersChange}
        />
        <PropertyInlineWrapper label="Image Size">
          <PropertyInputField
            placeholder="Value"
            value={component.preset?.defaultValue ?? ""}
            onChange={handleSizeChange}
            type="number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {component.preset?.enableSizeInMeters ? "meter" : "scale"}
                </InputAdornment>
              ),
            }}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};

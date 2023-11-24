import { ChangeEvent, useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertySelectField,
  PropertyWrapper,
} from "../../../../ui-components";

export type HeightReferenceFieldPreset = {
  defaultValue: "clamp" | "relative" | "none";
};

const OPTIONS = [
  {
    label: "Clamp to ground",
    value: "clamp",
  },
  {
    label: "Relative to ground",
    value: "relative",
  },
  {
    label: "None",
    value: "none",
  },
];

type SupportedFieldTypes =
  | "POINT_HEIGHT_REFERENCE_FIELD"
  | "POLYLINE_HEIGHT_REFERENCE_FIELD"
  | "POLYGON_HEIGHT_REFERENCE_FIELD";

export const EditorHeightReferenceField: React.FC<BasicFieldProps<SupportedFieldTypes>> = ({
  component,
  onUpdate,
}) => {
  const handleValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          defaultValue: e.target.value as HeightReferenceFieldPreset["defaultValue"],
        },
      });
    },
    [component, onUpdate],
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Height Reference">
          <PropertySelectField
            options={OPTIONS}
            value={component.preset?.defaultValue || "clamp"}
            onChange={handleValueChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};

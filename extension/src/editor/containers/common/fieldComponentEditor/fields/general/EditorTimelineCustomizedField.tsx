import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";

export type EditorTimelineCustomizedFieldPreset = {
  start?: string;
  end?: string;
  current?: string;
};

export const EditorTimelineCustomizedField: React.FC<
  BasicFieldProps<"TIMELINE_CUSTOMIZED_FIELD">
> = ({ component, onUpdate }) => {
  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          start: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleCurrentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          current: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          end: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Start Time">
          <PropertyInputField
            placeholder="ISO8601 Time String"
            value={component.preset?.start ?? ""}
            onChange={handleStartChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Current Time">
          <PropertyInputField
            placeholder="ISO8601 Time String"
            value={component.preset?.current ?? ""}
            onChange={handleCurrentChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="End Time">
          <PropertyInputField
            placeholder="ISO8601 Time String"
            value={component.preset?.end ?? ""}
            onChange={handleEndChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};

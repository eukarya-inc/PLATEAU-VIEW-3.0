import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertySelectField,
  PropertyWrapper,
} from "../../../../ui-components";

const timezoneOptions = [
  -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
].map(v => ({
  label: `UTC${v > 0 ? "+" : ""}${v}`,
  value: `${v > 0 ? "+" : ""}${v}`,
}));

export type EditorTimelineCustomizedFieldPreset = {
  start?: string;
  end?: string;
  current?: string;
  timezone?: string;
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

  const handleTimezoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          timezone: e.target.value,
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
        <PropertyInlineWrapper label="Display Timezone">
          <PropertySelectField
            options={timezoneOptions}
            value={component.preset?.timezone ?? "+9"}
            onChange={handleTimezoneChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};

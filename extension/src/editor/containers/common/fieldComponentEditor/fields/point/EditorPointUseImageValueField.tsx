import { useMemo, useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyCard,
  PropertyImageField,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
} from "../../../../ui-components";

export type PointUseImageValueFieldPreset = {
  defaultValue?: string;
  asLegend?: boolean;
  legendName?: string;
};

export const EditorPointUseImageValueField: React.FC<
  BasicFieldProps<"POINT_USE_IMAGE_VALUE_FIELD">
> = ({ component, onUpdate }) => {
  const preset = useMemo(() => {
    return component.preset ?? {};
  }, [component?.preset]);

  const handleRuleUpdate = useCallback(
    (preset: PointUseImageValueFieldPreset) => {
      onUpdate?.({
        ...component,
        preset,
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyCard
          id={""}
          noMove
          noRemove
          mainPanel={<RuleMainPanel preset={preset} onRuleUpdate={handleRuleUpdate} />}
          legendPanel={<RuleLegendPanel preset={preset} onRuleUpdate={handleRuleUpdate} />}
        />
      </PropertyBox>
    </PropertyWrapper>
  );
};

type RulePanelProps = {
  preset: PointUseImageValueFieldPreset;
  onRuleUpdate: (preset: PointUseImageValueFieldPreset) => void;
};

const RuleMainPanel: React.FC<RulePanelProps> = ({ preset, onRuleUpdate }) => {
  const handleUrlChange = useCallback(
    (imageURL: string) => {
      onRuleUpdate({
        ...preset,
        defaultValue: imageURL,
      });
    },
    [preset, onRuleUpdate],
  );

  return <PropertyImageField value={preset.defaultValue ?? ""} onChange={handleUrlChange} />;
};

const RuleLegendPanel: React.FC<RulePanelProps> = ({ preset, onRuleUpdate }) => {
  const handleLegendNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({ ...preset, legendName: e.target.value });
    },
    [preset, onRuleUpdate],
  );

  const handleAsLegendChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({
        ...preset,
        asLegend: e.target.checked,
      });
    },
    [preset, onRuleUpdate],
  );

  return (
    <>
      <PropertySwitch
        label="As Legend"
        checked={!!preset.asLegend}
        onChange={handleAsLegendChange}
      />
      <PropertyInputField
        placeholder="Display Title"
        value={preset.legendName ?? ""}
        onChange={handleLegendNameChange}
      />
    </>
  );
};

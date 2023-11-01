import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Select, SelectChangeEvent, styled } from "@mui/material";
import { useState, useMemo, useCallback, useEffect } from "react";

import { BasicFieldProps } from "..";
import { ParameterItem, SelectItem } from "../../../../../../prototypes/ui-components";
import { ColorMapSelectItemContent } from "../../../../../../prototypes/ui-components/ColorMapSelectItemContent";
import { COLOR_MAPS } from "../../../../../../shared/constants";
import {
  PropertyBox,
  PropertyButton,
  PropertyCard,
  PropertyInputField,
  PropertyLineWrapper,
  PropertyWrapper,
} from "../../../../ui-components";
import { generateID } from "../../../../utils";

type PointFillColorGradientFieldPresetRule = {
  id: string;
  propertyName?: string;
  legendName?: string;
  max?: number;
  min?: number;
  colorMapName?: string;
};

export type PointFillGradientColorFieldPreset = {
  rules?: PointFillColorGradientFieldPresetRule[];
};

const StyledParameterItem = styled(ParameterItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `2px solid transparent`,
  boxShadow: theme.shadows[1],
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: `calc(100% - ${theme.spacing(-2)})`,
  marginLeft: theme.spacing(-1),
})) as unknown as typeof Select; // For generics

export const EditorPointFillColorGradientField: React.FC<
  BasicFieldProps<"POINT_FILL_COLOR_GRADIENT_FIELD">
> = ({ component, onUpdate }) => {
  const [currentRuleId, setCurrentRuleId] = useState<string>();
  const [movingId, setMovingId] = useState<string>();

  const rules = useMemo(() => {
    return component?.preset?.rules ?? [];
  }, [component?.preset]);

  const currentRule = useMemo(() => {
    return rules.find(r => r.id === currentRuleId);
  }, [rules, currentRuleId]);

  const handleRuleCreate = useCallback(() => {
    const newRule: PointFillColorGradientFieldPresetRule = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        rules: [...rules, newRule],
      },
    });
  }, [component, rules, onUpdate]);

  const handleRuleSelect = useCallback((id: string) => {
    setCurrentRuleId(id);
  }, []);

  const handleRuleRemove = useCallback(
    (id: string) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.filter(r => r.id !== id),
        },
      });
    },
    [component, rules, onUpdate],
  );

  const handleRuleMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = rules.findIndex(r => r.id === id);
      if (index === -1) return;
      setMovingId(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= rules.length) return;
      const newRules = [...rules];
      newRules.splice(index, 1);
      newRules.splice(newIndex, 0, rules[index]);
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: newRules,
        },
      });
    },
    [component, rules, onUpdate],
  );

  const handleRuleUpdate = useCallback(
    (rule: PointFillColorGradientFieldPresetRule) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r => (r.id === rule.id ? rule : r)),
        },
      });
    },
    [component, rules, onUpdate],
  );

  useEffect(() => {
    if (movingId) {
      setTimeout(() => {
        if (movingId) setMovingId(undefined);
      }, 200);
    }
  }, [movingId]);

  const handleColorMapNameChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      if (!currentRule) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r =>
            r.id === currentRule.id ? { ...r, colorMapName: e.target.value } : r,
          ),
        },
      });
    },
    [component, currentRule, rules, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox asMenu>
        {rules.map((rule, index) => (
          <PropertyCard
            key={rule.id}
            id={rule.id}
            selected={rule.id === currentRule?.id}
            movingId={movingId}
            moveUpDisabled={index === 0}
            moveDownDisabled={index === rules.length - 1}
            onMove={handleRuleMove}
            onRemove={handleRuleRemove}
            onSelect={handleRuleSelect}
            mainPanel={<RuleMainPanel rule={rule} onRuleUpdate={handleRuleUpdate} />}
            legendPanel={<RuleLegendPanel rule={rule} onRuleUpdate={handleRuleUpdate} />}
          />
        ))}
        <PropertyButton onClick={handleRuleCreate}>
          <AddOutlinedIcon /> Rule
        </PropertyButton>
      </PropertyBox>
      {currentRule && (
        <PropertyBox>
          <StyledParameterItem labelFontSize={"small"} label={"Gradient colors"} gutterBottom>
            <StyledSelect
              variant="filled"
              fullWidth
              value={currentRule.colorMapName}
              onChange={handleColorMapNameChange}>
              {COLOR_MAPS.map(colorMap => (
                <SelectItem key={colorMap.name} value={colorMap.name}>
                  <ColorMapSelectItemContent colorMap={colorMap} />
                </SelectItem>
              ))}
            </StyledSelect>
          </StyledParameterItem>
        </PropertyBox>
      )}
    </PropertyWrapper>
  );
};

type RulePanelProps = {
  rule: PointFillColorGradientFieldPresetRule;
  onRuleUpdate: (rule: PointFillColorGradientFieldPresetRule) => void;
};

const RuleMainPanel: React.FC<RulePanelProps> = ({ rule, onRuleUpdate }) => {
  const handlePropertyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({
        ...rule,
        propertyName: e.target.value,
      });
    },
    [rule, onRuleUpdate],
  );

  const [minText, setMinText] = useState(rule.min?.toString());
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMinText(e.target.value);
      onRuleUpdate({
        ...rule,
        min: Number(e.target.value) ?? 0,
      });
    },
    [rule, onRuleUpdate],
  );

  const [maxText, setMaxText] = useState(rule.max?.toString());
  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMaxText(e.target.value);
      onRuleUpdate({
        ...rule,
        max: Number(e.target.value) ?? 0,
      });
    },
    [rule, onRuleUpdate],
  );

  return (
    <>
      <PropertyInputField
        placeholder="Property Name"
        value={rule.propertyName ?? ""}
        onChange={handlePropertyNameChange}
      />
      <PropertyLineWrapper>
        <PropertyInputField
          type="number"
          placeholder="Min"
          value={minText ?? ""}
          onChange={handleMinChange}
        />
        ~
        <PropertyInputField
          placeholder="Max"
          type="number"
          value={maxText ?? ""}
          onChange={handleMaxChange}
        />
      </PropertyLineWrapper>
    </>
  );
};

const RuleLegendPanel: React.FC<RulePanelProps> = ({ rule, onRuleUpdate }) => {
  const handleLegendNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({
        ...rule,
        legendName: e.target.value,
      });
    },
    [rule, onRuleUpdate],
  );

  return (
    <PropertyInputField
      placeholder="Rule Name"
      value={rule.legendName ?? ""}
      onChange={handleLegendNameChange}
    />
  );
};

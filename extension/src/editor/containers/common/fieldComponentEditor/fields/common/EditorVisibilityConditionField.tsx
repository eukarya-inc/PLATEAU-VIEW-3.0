import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useMemo, useCallback, ReactElement } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
  PropertyLineWrapper,
  PropertyButton,
  PropertyCard,
} from "../../../../ui-components";
import {
  OperationValue,
  PropertyOperationSelectField,
} from "../../../../ui-components/property/PropertyOperationSelectField";
import { generateID } from "../../../../utils";

type SupportedFieldTypes =
  | "POINT_VISIBILITY_CONDITION_FIELD"
  | "POLYLINE_VISIBILITY_CONDITION_FIELD"
  | "POLYGON_VISIBILITY_CONDITION_FIELD";

type VisibilityConditionFieldPresetCondition = {
  id: string;
  propertyName?: string;
  operation?: OperationValue;
  value?: string;
  show?: boolean;
};

export type VisibilityConditionFieldPreset = {
  conditions: VisibilityConditionFieldPresetCondition[];
};

export const EditorVisibilityConditionField = ({
  component,
  onUpdate,
}: BasicFieldProps<SupportedFieldTypes>): ReactElement | null => {
  const conditions = useMemo(() => {
    return component?.preset?.conditions ?? [];
  }, [component?.preset]);

  const handleConditionUpdate = useCallback(
    (rule: VisibilityConditionFieldPresetCondition) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: conditions.map(r => (r.id === rule.id ? rule : r)),
        },
      });
    },
    [component, onUpdate, conditions],
  );

  const handleConditionCreate = useCallback(() => {
    const newRule: VisibilityConditionFieldPresetCondition = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        conditions: [...conditions, newRule],
      },
    });
  }, [component, conditions, onUpdate]);

  return (
    <PropertyWrapper>
      <PropertyBox>
        {conditions.map(condition => (
          <PropertyCard
            id={condition.id}
            key={condition.id}
            mainPanel={
              <ConditionPanel condition={condition} onConditionUpdate={handleConditionUpdate} />
            }
          />
        ))}
        <PropertyButton onClick={handleConditionCreate}>
          <AddOutlinedIcon /> Condition
        </PropertyButton>
      </PropertyBox>
    </PropertyWrapper>
  );
};

type ConditionPanelProps = {
  condition: VisibilityConditionFieldPresetCondition;
  onConditionUpdate: (condition: VisibilityConditionFieldPresetCondition) => void;
};

const ConditionPanel: React.FC<ConditionPanelProps> = ({ condition, onConditionUpdate }) => {
  const handlePropertyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({ ...condition, propertyName: e.target.value });
    },
    [condition, onConditionUpdate],
  );

  const handleOperationChange = useCallback(
    (v: OperationValue) => {
      onConditionUpdate({ ...condition, operation: v });
    },
    [condition, onConditionUpdate],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({ ...condition, value: e.target.value });
    },
    [condition, onConditionUpdate],
  );

  const handleShowChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({
        ...condition,
        show: e.target.checked,
      });
    },
    [condition, onConditionUpdate],
  );

  return (
    <>
      <PropertyLineWrapper>
        IF
        <PropertyInputField
          placeholder="Property"
          value={condition.propertyName ?? ""}
          onChange={handlePropertyNameChange}
        />
        <PropertyOperationSelectField
          operation={condition.operation}
          onChange={handleOperationChange}
        />
        <PropertyInputField
          placeholder="Value"
          value={condition.value ?? ""}
          onChange={handleValueChange}
        />
      </PropertyLineWrapper>
      <PropertySwitch label="Show" checked={!!condition.show} onChange={handleShowChange} />
    </>
  );
};

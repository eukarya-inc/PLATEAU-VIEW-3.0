import { useCallback } from "react";

import { PropertyInputField } from "./PropertyInputField";
import { PropertySelectField } from "./PropertySelectField";
import { PropertyLineWrapper } from "./PropertyWrapper";

const operationOptions = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "===", label: "=" },
  { value: "!==", label: "!=" },
];

export type CommonCondition = {
  operation?: "=" | "!=" | ">" | ">=" | "<" | "<=";
  value?: string;
};

type PropertyConditionFieldProps = {
  condition: CommonCondition;
  onConditionChange: (condition: CommonCondition) => void;
};

export const PropertyConditionField: React.FC<PropertyConditionFieldProps> = ({
  condition,
  onConditionChange,
}) => {
  const handleOperationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionChange({
        ...condition,
        operation: e.target.value as CommonCondition["operation"],
      });
    },
    [condition, onConditionChange],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionChange({
        ...condition,
        value: e.target.value,
      });
    },
    [condition, onConditionChange],
  );

  return (
    <PropertyLineWrapper>
      IF
      <PropertySelectField
        placeholder="Operation"
        sx={{ width: "80px" }}
        options={operationOptions}
        value={condition.operation ?? ""}
        onChange={handleOperationChange}
      />
      <PropertyInputField
        placeholder="Value"
        value={condition.value ?? ""}
        onChange={handleValueChange}
      />
    </PropertyLineWrapper>
  );
};

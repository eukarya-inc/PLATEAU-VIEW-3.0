import { useCallback, useState } from "react";

import { BaseFieldProps } from "../../types";

import { useBuildingTransparency } from "./useBuildingTransparency";

type OptionsState = Omit<BaseFieldProps<"buildingTransparency">["value"], "id" | "group" | "type">;

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingTransparency">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    transparency: value.transparency,
  });

  const handleUpdate = useCallback(
    (property: any) => {
      onUpdate({ ...value, ...options, updatedAt: new Date(), override: { "3dtiles": property } });
    },
    [onUpdate, value, options],
  );

  const handleUpdateOptions = useCallback(
    <P extends keyof OptionsState>(prop: P, v?: OptionsState[P]) => {
      setOptions(o => {
        const next = { ...o, [prop]: v };
        return next;
      });
    },
    [],
  );

  const handleUpdateNumber = useCallback(
    (prop: keyof OptionsState) => (value: number) => {
      handleUpdateOptions(prop, value);
    },
    [handleUpdateOptions],
  );

  useBuildingTransparency({ options, dataID, onUpdate: handleUpdate });

  return {
    options,
    handleUpdateNumber,
  };
};

export default useHooks;

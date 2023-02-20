import { useCallback, useEffect, useState } from "react";

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
    <P extends keyof OptionsState>(prop: P, v?: OptionsState[P]) => {
      setOptions(o => {
        const next = { ...o, [prop]: v };
        onUpdate({ id: value.id, type: value.type, group: value.group, ...next });
        return next;
      });
    },
    [onUpdate, value],
  );

  const handleUpdateNumber = useCallback(
    (prop: keyof OptionsState) => (value: number) => {
      handleUpdate(prop, value);
    },
    [handleUpdate],
  );

  useEffect(() => {
    if (options.transparency !== value.transparency) {
      setOptions({ ...value });
    }
  }, [value, onUpdate, options]);

  useBuildingTransparency({ options, dataID });

  return {
    options,
    handleUpdateNumber,
  };
};

export default useHooks;

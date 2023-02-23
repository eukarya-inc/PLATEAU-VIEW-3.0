import isEqual from "lodash/isEqual";
import pick from "lodash/pick";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { useBuildingFilter } from "./useBuildingFilter";

type OptionsState = Omit<BaseFieldProps<"buildingFilter">["value"], "id" | "group" | "type">;

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingFilter">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    height: value.height,
    abovegroundFloor: value.abovegroundFloor,
    basementFloor: value.basementFloor,
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

  const handleUpdateRange = useCallback(
    (prop: keyof OptionsState) => (value: number | number[]) => {
      if (value && Array.isArray(value)) {
        handleUpdate(prop, value as [from: number, to: number]);
      }
    },
    [handleUpdate],
  );

  useEffect(() => {
    if (!isEqual(options, pick(value, "height", "abovegroundFloor", "basementFloor"))) {
      setOptions({ ...value });
    }
  }, [options, value]);

  useBuildingFilter({ options, dataID });

  return {
    options,
    handleUpdateRange,
  };
};

export default useHooks;

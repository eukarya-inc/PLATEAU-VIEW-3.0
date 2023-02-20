import { isEqual } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { useClippingBox } from "./useClippingBox";

type OptionsState = Omit<BaseFieldProps<"clipping">["value"], "id" | "group" | "type">;

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"clipping">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    enabled: false,
    show: false,
    aboveGroundOnly: false,
    direction: "inside",
  });

  const handleUpdate = useCallback(
    <P extends keyof OptionsState>(prop: P, v?: OptionsState[P]) => {
      setOptions(o => {
        const next = { ...o, [prop]: v ?? !o[prop] };
        onUpdate({ id: value.id, type: value.type, group: value.group, ...next });
        return next;
      });
    },
    [onUpdate, value],
  );

  const handleUpdateBool = useCallback(
    (prop: keyof OptionsState) => () => {
      handleUpdate(prop);
    },
    [handleUpdate],
  );

  const handleUpdateSelect = useCallback(
    (prop: keyof OptionsState) => (value: unknown) => {
      handleUpdate(prop, value as OptionsState["direction"]);
    },
    [handleUpdate],
  );

  useEffect(() => {
    if (!isEqual(options, value)) {
      setOptions({ ...value });
    }
  }, [options, value, onUpdate]);

  useClippingBox({ value, dataID });

  return {
    options,
    handleUpdateBool,
    handleUpdateSelect,
  };
};

export default useHooks;

import { useCallback, useState } from "react";

import { BaseFieldProps } from "../../types";

import { useClippingBox } from "./useClippingBox";

type OptionsState = Omit<BaseFieldProps<"clipping">["value"], "id" | "group" | "type">;

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"clipping">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    enabled: value.enabled,
    show: value.show,
    aboveGroundOnly: value.aboveGroundOnly,
    direction: value.direction,
  });

  const handleUpdate = useCallback(
    (tilesetProperty: any, boxProperty: any) => {
      onUpdate({
        ...value,
        ...options,
        override: { ["3dtiles"]: tilesetProperty, box: boxProperty },
      });
    },
    [onUpdate, value, options],
  );

  const handleUpdateOptions = useCallback(
    <P extends keyof OptionsState>(prop: P, v?: OptionsState[P]) => {
      setOptions(o => {
        const next = { ...o, [prop]: v ?? !o[prop] };
        return next;
      });
    },
    [],
  );

  const handleUpdateBool = useCallback(
    (prop: keyof OptionsState) => () => {
      handleUpdateOptions(prop);
    },
    [handleUpdateOptions],
  );

  const handleUpdateSelect = useCallback(
    (prop: keyof OptionsState) => (value: unknown) => {
      handleUpdateOptions(prop, value as OptionsState["direction"]);
    },
    [handleUpdateOptions],
  );

  useClippingBox({ options, dataID, onUpdate: handleUpdate });

  return {
    options,
    handleUpdateBool,
    handleUpdateSelect,
  };
};

export default useHooks;

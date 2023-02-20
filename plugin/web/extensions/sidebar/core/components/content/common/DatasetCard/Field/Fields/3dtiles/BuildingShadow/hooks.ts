import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useRef, useState } from "react";

import { BaseFieldProps } from "../../types";

import { useBuildingShadow } from "./useBuildingShadow";

type OptionsState = Omit<BaseFieldProps<"buildingShadow">["value"], "id" | "group" | "type">;

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingShadow">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    shadow: value.shadow,
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

  const handleUpdateSelect = useCallback(
    (prop: keyof OptionsState) => (value: any) => {
      handleUpdate(prop, value as OptionsState["shadow"]);
    },
    [handleUpdate],
  );

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) return;
    if (!isEqual(options, value)) {
      setOptions({ ...value });
    }
  }, [value, options]);

  // This is workaround.
  // Initializing shadow with "disabled" makes tileset shadow to keep "enabled",
  // so we need to initialize with "enabled", then change shadow with "disabled".
  useEffect(() => {
    setOptions({ shadow: "enabled" });
    setTimeout(() => {
      setOptions({ shadow: "disabled" });
      initialized.current = true;
    }, 10);
  }, []);

  useBuildingShadow({ options, dataID });

  return {
    options,
    handleUpdateSelect,
  };
};

export default useHooks;

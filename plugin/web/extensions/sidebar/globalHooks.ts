import { useCallback, useEffect } from "react";

import { useCurrentOverrides } from "./state";
import { ReearthApi } from "./types";
import { mergeProperty, postMsg } from "./utils";

export default () => {
  const [overrides, updateOverrides] = useCurrentOverrides();

  const handleOverridesUpdate = useCallback(
    (updatedProperties: Partial<ReearthApi>) => {
      updateOverrides([overrides, updatedProperties].reduce((p, v) => mergeProperty(p, v)));
    },
    [overrides],
  );

  useEffect(() => {
    postMsg({ action: "updateOverrides", payload: overrides });
  }, [overrides]);

  return {
    overrides,
    handleOverridesUpdate,
  };
};

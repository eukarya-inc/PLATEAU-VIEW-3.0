import { useCallback } from "react";

import { postMsg } from "../../core/utils";

export default () => {
  const handleClose = useCallback(() => {
    postMsg({ action: "modal-close" });
  }, []);

  return { handleClose };
};

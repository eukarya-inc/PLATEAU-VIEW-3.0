import { useCallback } from "react";

import { ReearthSketchType } from "../types";

export const useSketch = () => {
  const handleSetType = useCallback((type: ReearthSketchType | undefined) => {
    window.reearth?.sketch?.setType(type);
  }, []);

  const handleCreateDataOnly = useCallback((dataOnly: boolean) => {
    window.reearth?.sketch?.createDataOnly(dataOnly);
  }, []);

  const handleAllowRightClickToAbort = useCallback((allow: boolean) => {
    window.reearth?.sketch?.allowRightClickToAbort(allow);
  }, []);

  const handleAllowAutoResetInteractionMode = useCallback((allow: boolean) => {
    window.reearth?.sketch?.allowAutoResetInteractionMode(allow);
  }, []);

  return {
    handleSetType,
    handleCreateDataOnly,
    handleAllowRightClickToAbort,
    handleAllowAutoResetInteractionMode,
  };
};

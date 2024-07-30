import { useCallback } from "react";

import { ReearthSketchType } from "../types";
import { isReEarthAPIv2 } from "../utils/reearth";

export const useSketch = () => {
  const handleSetType = useCallback((type: ReearthSketchType | undefined) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.setTool?.(type)
      : window.reearth?.sketch?.setType(type);
  }, []);

  const handleSetColor = useCallback((color: string) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.overrideOptions?.({ color })
      : window.reearth?.sketch?.setColor(color);
  }, []);

  const handleCreateDataOnly = useCallback((dataOnly: boolean) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.overrideOptions?.({ dataOnly })
      : window.reearth?.sketch?.createDataOnly(dataOnly);
  }, []);

  const handleDisableShadow = useCallback((disable: boolean) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.overrideOptions?.({ disableShadow: disable })
      : window.reearth?.sketch?.disableShadow(disable);
  }, []);

  const handleEnableRelativeHeight = useCallback((enable: boolean) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.overrideOptions?.({ enableRelativeHeight: enable })
      : window.reearth?.sketch?.enableRelativeHeight(enable);
  }, []);

  const handleAllowRightClickToAbort = useCallback((allow: boolean) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.overrideOptions?.({ rightClickToAbort: allow })
      : window.reearth?.sketch?.allowRightClickToAbort(allow);
  }, []);

  const handleAllowAutoResetInteractionMode = useCallback((allow: boolean) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.sketch?.overrideOptions?.({ autoResetInteractionMode: allow })
      : window.reearth?.sketch?.allowAutoResetInteractionMode(allow);
  }, []);

  return {
    handleSetType,
    handleSetColor,
    handleCreateDataOnly,
    handleDisableShadow,
    handleEnableRelativeHeight,
    handleAllowRightClickToAbort,
    handleAllowAutoResetInteractionMode,
  };
};

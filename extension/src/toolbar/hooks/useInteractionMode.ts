import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { ToolType, toolAtom } from "../../prototypes/view/states/tool";
import { InteractionModeType } from "../../shared/reearth/types";
import { reearthInteractionModeAtom } from "../../shared/states/interactionMode";

const TOOL_TO_INTERACTIONMODE: Record<ToolType, InteractionModeType> = {
  hand: "move",
  select: "selection",
  sketch: "sketch",
  story: "default", // TODO: Check later
  pedestrian: "move", // TODO: Check later
};

export const useInteractionMode = () => {
  const tool = useAtomValue(toolAtom);
  const setInteractionMode = useSetAtom(reearthInteractionModeAtom);
  useEffect(() => {
    if (tool) {
      setInteractionMode(TOOL_TO_INTERACTIONMODE[tool.type]);
    }
  }, [tool, setInteractionMode]);
};

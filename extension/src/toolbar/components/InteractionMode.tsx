import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { Tool, toolAtom } from "../../prototypes/view/states/tool";
import { InteractionModeType } from "../../shared/reearth/types";
import { reearthInteractionModeAtom } from "../../shared/states/interactionMode";

const TOOL_TO_INTERACTIONMODE: Record<Tool, InteractionModeType> = {
  hand: "move",
  select: "selection",
  sketch: "sketch",
  story: "default", // TODO: Check later
  pedestrian: "move", // TODO: Check later
};

export const InteractionMode = () => {
  const tool = useAtomValue(toolAtom);
  const setInteractionMode = useSetAtom(reearthInteractionModeAtom);
  useEffect(() => {
    if (tool) {
      setInteractionMode(TOOL_TO_INTERACTIONMODE[tool]);
    }
  }, [tool, setInteractionMode]);

  return null;
};

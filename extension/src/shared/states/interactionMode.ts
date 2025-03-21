import { atom } from "jotai";

import { InteractionModeType } from "../reearth/types";
import { isReEarthAPIv2 } from "../reearth/utils/reearth";
import { sharedAtom } from "../sharedAtoms";

export const interactionModeAtom = sharedAtom<InteractionModeType>("interactionMode", "move");
export const reearthInteractionModeAtom = atom(null, (_get, set, update: InteractionModeType) => {
  isReEarthAPIv2(window.reearth)
    ? window.reearth?.viewer?.interactionMode?.override?.(update)
    : window.reearth?.interactionMode?.override?.(update);
  set(interactionModeAtom, async () => update);
});

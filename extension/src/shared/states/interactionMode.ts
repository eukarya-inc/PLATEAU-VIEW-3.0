import { atom } from "jotai";

import { InteractionModeType } from "../reearth/interactionMode";
import { sharedAtom } from "../sharedAtoms";

export const interactionModeAtom = sharedAtom<InteractionModeType>("interactionMode", "move");
export const reearthInteractionModeAtom = atom(null, (_get, set, update: InteractionModeType) => {
  window.reearth.interactionMode?.override?.(update);
  set(interactionModeAtom, () => update);
});

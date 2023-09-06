import { environmentTypeAtom } from "../../prototypes/view/states/app";
import { graphicsQualityAtom } from "../../prototypes/view/states/graphics";
import { sharedStoreAtomWrapper } from "../sharedAtoms";

export const sharableGraphicsQualityAtom = sharedStoreAtomWrapper(
  "graphicsQuality",
  graphicsQualityAtom,
);
export const sharableEnvironmentTypeAtom = sharedStoreAtomWrapper(
  "environmentType",
  environmentTypeAtom,
);

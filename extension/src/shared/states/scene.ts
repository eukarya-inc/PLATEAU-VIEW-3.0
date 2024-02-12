import {
  environmentTypeAtom,
  showMapLabelAtom,
  logarithmicTerrainElevationAtom,
  terrainElevationHeightRangeAtom,
} from "../../prototypes/view/states/app";
import { graphicsQualityAtom } from "../../prototypes/view/states/graphics";
import { CameraPosition } from "../reearth/types";
import { sharedAtom, sharedStoreAtom, sharedStoreAtomWrapper } from "../sharedAtoms";

export const shareableGraphicsQualityAtom = sharedStoreAtomWrapper(
  "graphicsQuality",
  graphicsQualityAtom,
);
export const shareableEnvironmentTypeAtom = sharedStoreAtomWrapper(
  "environmentType",
  environmentTypeAtom,
);

export const shareableShowMapLabelAtom = sharedStoreAtomWrapper("ShowMapLabel", showMapLabelAtom);

export const shareableTerrainElevationHeightRangeAtom = sharedStoreAtomWrapper(
  "terrainElevationHeightRange",
  terrainElevationHeightRangeAtom,
);
export const shareableLogarithmicTerrainElevationAtom = sharedStoreAtomWrapper(
  "logarithmicTerrainElevation",
  logarithmicTerrainElevationAtom,
);

export const sharedInitialCameraAtom = sharedStoreAtom(
  sharedAtom<CameraPosition | undefined>("initialCamera", undefined),
);

export const sharedInitialClockAtom = sharedStoreAtom(
  sharedAtom<number | undefined>("initialClock", undefined),
);

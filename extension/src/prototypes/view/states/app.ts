import { isNumber } from "class-validator";
import { atom, type SetStateAction } from "jotai";
import { atomWithReset, type RESET } from "jotai/utils";

import type { AnnotationType } from "../../../shared/reearth/types/getAnnotationType";
import { atomWithStorageValidation } from "../../shared-states";
import { EnvironmentType } from "../types/environment";
import { TerrainType } from "../types/terrain";

import { shadowMapEnabledAtom } from "./graphics";

export const readyAtom = atom<boolean>(false);
export const hideAppOverlayAtom = atom(false);
export const showDeveloperPanelsAtom = atom(false);
export const showFeedbackModalAtom = atom(false);
export const showMyDataModalAtom = atom(false);
export const viewportWidthAtom = atom<number | null>(null);
export const viewportHeightAtom = atom<number | null>(null);

const environmentTypePrimitiveAtom = atomWithReset<EnvironmentType>("map");
export const environmentTypeAtom = atom(
  get => get(environmentTypePrimitiveAtom),
  (_get, set, value: SetStateAction<EnvironmentType> | typeof RESET) => {
    set(environmentTypePrimitiveAtom, value);
    if (value === "google-photorealistic") {
      set(shadowMapEnabledAtom, false);
    }
  },
);
export const terrainTypeAtom = atomWithReset<TerrainType>("plateau");
export const enableTerrainLightingAtom = atomWithReset(true);
export const terrainElevationHeightRangeAtom = atomWithReset([0, 4000]);
export const logarithmicTerrainElevationAtom = atomWithReset(true);
export const showMapLabelAtom = atomWithReset<Record<AnnotationType, boolean>>({
  municipalities: false,
  towns: false,
  roads: false,
  railways: false,
  stations: false,
  landmarks: false,
  topography: false,
});

export const debugSphericalHarmonicsAtom = atomWithReset(false);
export const showShadowMapDepthAtom = atomWithReset(false);
export const showShadowMapCascadeColorsAtom = atomWithReset(false);

export const showDataFormatsAtom = atomWithReset(false);
export const showAreaEntitiesAtom = atomWithReset(false);

export const showSelectionBoundingSphereAtom = atomWithReset(false);

export const enableKeyboardCameraControlAtom = atomWithReset(false);

export const inspectorWidthAtom = atomWithStorageValidation({
  key: "inspectorWidth",
  initialValue: 320,
  validate: isNumber,
});

export const pedestrianInspectorWidthAtom = atomWithStorageValidation({
  key: "pedestrianInspectorWidth",
  initialValue: 540,
  validate: isNumber,
});

import { isBoolean, isNumber } from "class-validator";
import { atom, type SetStateAction } from "jotai";
import { atomWithReset, type RESET } from "jotai/utils";
import { fromPairs, isEqual } from "lodash";

import { atomWithStorageValidation, type AtomValue } from "../../shared-states";
import { MOBILE_WIDTH } from "../constants/ui";
import { AmbientOcclusionOutputType } from "../types/hbao";

const initialWithMobile = !!window.matchMedia(`(max-width: ${MOBILE_WIDTH}px)`).matches;

export type AntialiasType = "none" | "fxaa" | "msaa2x" | "msaa4x" | "msaa8x";

export function isAntialiasType(value: unknown): value is AntialiasType {
  return (
    value === "none" ||
    value === "fxaa" ||
    value === "msaa2x" ||
    value === "msaa4x" ||
    value === "msaa8x"
  );
}

export const nativeResolutionEnabledAtom = atomWithStorageValidation({
  key: "nativeResolutionEnabled",
  initialValue: false,
  validate: isBoolean,
});

export const explicitRenderingEnabledAtom = atomWithReset(true);

export const antialiasTypeAtom = atomWithStorageValidation({
  key: "antialiasType",
  initialValue: (initialWithMobile ? "none" : "msaa4x") as AntialiasType,
  validate: isAntialiasType,
});

export type ShadowMapSize = 1024 | 2048 | 4096;

export function isShadowMapSize(value: unknown): value is ShadowMapSize {
  return value === 1024 || value === 2048 || value === 4096;
}

export const shadowMapEnabledAtom = atomWithStorageValidation({
  key: "shadowMapEnabled",
  initialValue: true,
  validate: isBoolean,
});

export const shadowMapSizeAtom = atomWithStorageValidation({
  key: "shadowMapSize",
  initialValue: (initialWithMobile ? 1024 : 4096) as ShadowMapSize,
  validate: isShadowMapSize,
});

export const shadowMapSoftShadowsAtom = atomWithStorageValidation({
  key: "shadowMapSoftShadows",
  initialValue: initialWithMobile ? false : true,
  validate: isBoolean,
});

export const ambientOcclusionEnabledAtom = atomWithStorageValidation({
  key: "ambientOcclusionEnabled",
  initialValue: initialWithMobile ? false : true,
  validate: isBoolean,
});

export const ambientOcclusionIntensityAtom = atomWithReset(100);
export const ambientOcclusionMaxRadiusAtom = atomWithReset(40);
export const ambientOcclusionBiasAtom = atomWithReset(0.1);

export const ambientOcclusionDirectionsAtom = atomWithStorageValidation({
  key: "ambientOcclusionDirections",
  initialValue: 4,
  validate: isNumber,
});

export const ambientOcclusionStepsAtom = atomWithStorageValidation({
  key: "ambientOcclusionSteps",
  initialValue: initialWithMobile ? 4 : 8,
  validate: isNumber,
});

const ambientOcclusionTextureScalePrimitiveAtom = atomWithStorageValidation({
  key: "ambientOcclusionTextureScale",
  initialValue: 0.5,
  validate: isNumber,
});
export const ambientOcclusionTextureScaleAtom = atom(
  get => (get(nativeResolutionEnabledAtom) ? get(ambientOcclusionTextureScalePrimitiveAtom) : 1),
  (_get, set, value: SetStateAction<number> | typeof RESET) => {
    set(ambientOcclusionTextureScalePrimitiveAtom, value);
  },
);

const ambientOcclusionDenoisePrimitiveAtom = atomWithStorageValidation({
  key: "ambientOcclusionDenoise",
  initialValue: true,
  validate: isBoolean,
});
export const ambientOcclusionDenoiseAtom = atom(
  get => get(ambientOcclusionDenoisePrimitiveAtom),
  (get, set, value: SetStateAction<boolean> | typeof RESET) => {
    set(ambientOcclusionDenoisePrimitiveAtom, value);
    if (!get(ambientOcclusionDenoisePrimitiveAtom)) {
      set(ambientOcclusionOutputTypeAtom, value =>
        value === AmbientOcclusionOutputType.Weight ? null : value,
      );
    }
  },
);

export const ambientOcclusionAccurateNormalReconstructionAtom = atomWithStorageValidation({
  key: "ambientOcclusionAccurateNormalReconstruction",
  initialValue: true,
  validate: isBoolean,
});
export const ambientOcclusionOutputTypeAtom = atomWithReset<AmbientOcclusionOutputType | null>(
  null,
);

export const ambientOcclusionBlackPointAtom = atomWithReset(0.05);
export const ambientOcclusionWhitePointAtom = atomWithReset(0.9);
export const ambientOcclusionGammaAtom = atomWithReset(2.5);

export type GraphicsQuality = "low" | "medium" | "high" | "ultra";

const graphicsQualityAtoms = {
  nativeResolutionEnabled: nativeResolutionEnabledAtom,
  antialiasType: antialiasTypeAtom,
  shadowMapEnabled: shadowMapEnabledAtom,
  shadowMapSize: shadowMapSizeAtom,
  shadowMapSoftShadows: shadowMapSoftShadowsAtom,
  ambientOcclusionEnabled: ambientOcclusionEnabledAtom,
  ambientOcclusionDirections: ambientOcclusionDirectionsAtom,
  ambientOcclusionSteps: ambientOcclusionStepsAtom,
  ambientOcclusionTextureScale: ambientOcclusionTextureScalePrimitiveAtom,
  ambientOcclusionDenoise: ambientOcclusionDenoisePrimitiveAtom,
  ambientOcclusionAccurateNormalReconstruction: ambientOcclusionAccurateNormalReconstructionAtom,
};

type GraphicsQualityAtomValues = {
  [K in keyof typeof graphicsQualityAtoms]?: AtomValue<(typeof graphicsQualityAtoms)[K]>;
};

const graphicQualityAtomValues: Record<GraphicsQuality, GraphicsQualityAtomValues> = {
  low: {
    nativeResolutionEnabled: false,
    antialiasType: "none",
    shadowMapEnabled: true,
    shadowMapSize: 1024,
    shadowMapSoftShadows: false,
    ambientOcclusionEnabled: false,
    ambientOcclusionDirections: 4,
    ambientOcclusionSteps: 4,
    ambientOcclusionTextureScale: 0.5,
    ambientOcclusionDenoise: true,
    ambientOcclusionAccurateNormalReconstruction: true,
  },
  medium: {
    nativeResolutionEnabled: false,
    antialiasType: "fxaa",
    shadowMapEnabled: true,
    shadowMapSize: 2048,
    shadowMapSoftShadows: true,
    ambientOcclusionEnabled: true,
    ambientOcclusionDirections: 4,
    ambientOcclusionSteps: 4,
    ambientOcclusionTextureScale: 0.5,
    ambientOcclusionDenoise: true,
    ambientOcclusionAccurateNormalReconstruction: true,
  },
  high: {
    nativeResolutionEnabled: false,
    antialiasType: "msaa4x",
    shadowMapEnabled: true,
    shadowMapSize: 4096,
    shadowMapSoftShadows: true,
    ambientOcclusionEnabled: true,
    ambientOcclusionDirections: 4,
    ambientOcclusionSteps: 8,
    ambientOcclusionTextureScale: 0.5,
    ambientOcclusionDenoise: true,
    ambientOcclusionAccurateNormalReconstruction: true,
  },
  ultra: {
    nativeResolutionEnabled: true,
    antialiasType: "msaa4x",
    shadowMapEnabled: true,
    shadowMapSize: 4096,
    shadowMapSoftShadows: true,
    ambientOcclusionEnabled: true,
    ambientOcclusionDirections: 8,
    ambientOcclusionSteps: 8,
    ambientOcclusionTextureScale: 1,
    ambientOcclusionDenoise: true,
    ambientOcclusionAccurateNormalReconstruction: true,
  },
};

export const graphicsQualityAtom = atom(
  get => {
    const values = fromPairs(
      Object.entries(graphicsQualityAtoms).map(([key, atom]) => [
        key,
        // @ts-expect-error Unresolvable union
        get(atom),
      ]),
    );
    return isEqual(values, graphicQualityAtomValues.low)
      ? "low"
      : isEqual(values, graphicQualityAtomValues.medium)
      ? "medium"
      : isEqual(values, graphicQualityAtomValues.high)
      ? "high"
      : isEqual(values, graphicQualityAtomValues.ultra)
      ? "ultra"
      : null;
  },
  (_get, set, value: GraphicsQuality) => {
    Object.entries(graphicsQualityAtoms).forEach(([key, atom]) => {
      // @ts-expect-error Unresolvable union
      set(atom, graphicQualityAtomValues[value][key]);
    });
  },
);

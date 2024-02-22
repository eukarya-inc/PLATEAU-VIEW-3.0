import { SetStateAction, atom } from "jotai";

import { XYZ } from "../../shared/reearth/types";
import { LayerModelBase } from "../layers";

import { updateOrderAtom } from "./states";
import {
  type LayerImageScheme,
  type ConfigurableLayerModelBase,
  type LayerColorScheme,
  type LayerTitle,
} from "./types";

export interface ViewLayerModelParams {
  id?: string;
  title?: string;
  colorScheme?: LayerColorScheme;
  imageScheme?: LayerImageScheme;
}

export interface ViewLayerModel extends LayerModelBase {
  isViewLayer: true;
}

export function createViewLayerModel(
  params: ViewLayerModelParams,
): ConfigurableLayerModelBase<ViewLayerModel> {
  const hiddenAtom = atom(false);
  const hiddenAtomWrapper = atom(
    get => get(hiddenAtom),
    (get, set, update: SetStateAction<boolean>) => {
      const next = typeof update === "function" ? update(get(hiddenAtom)) : update;
      set(hiddenAtom, next);
      set(updateOrderAtom, get(updateOrderAtom) + 1);
    },
  );
  return {
    id: params.id,
    handleRef: {},
    isViewLayer: true,
    titleAtom: atom<LayerTitle | null>(params.title ?? null),
    loadingAtom: atom(false),
    hiddenAtom: hiddenAtomWrapper,
    layerIdAtom: atom<string | null>(null),
    boundingSphereAtom: atom<XYZ | null>(null),
    colorSchemeAtom: atom<LayerColorScheme | null>(params.colorScheme ?? null),
    imageSchemeAtom: atom<LayerImageScheme | null>(params.imageScheme ?? null),
  };
}

import { atom } from "jotai";

import { LayerModelBase } from "../layers";

import { type ConfigurableLayerModelBase, type LayerColorScheme, type LayerTitle } from "./types";

export interface ViewLayerModelParams {
  id?: string;
  title?: string;
  colorScheme?: LayerColorScheme;
}

export interface ViewLayerModel extends LayerModelBase {
  isViewLayer: true;
}

export function createViewLayerModel(
  params: ViewLayerModelParams,
): ConfigurableLayerModelBase<ViewLayerModel> {
  return {
    id: params.id,
    handleRef: {},
    isViewLayer: true,
    titleAtom: atom<LayerTitle | null>(params.title ?? null),
    loadingAtom: atom(false),
    hiddenAtom: atom(false),
    layerIdAtom: atom<string | null>(null),
    colorSchemeAtom: atom<LayerColorScheme | null>(params.colorScheme ?? null),
  };
}

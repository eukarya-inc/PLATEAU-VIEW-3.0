import { Atom, PrimitiveAtom } from "jotai";
import { type SetOptional } from "type-fest";

import { type LayerModelBase } from "../../prototypes/layers";
import { LayerModelOverrides as ReEarthLayerModelOverrides } from "../../shared/view-layers";
import { type QualitativeColorSet, type QuantitativeColorMap } from "../datasets";
import { type LayerListItemProps } from "../ui-components";

export type ConfigurableLayerModel<T extends LayerModelBase> = SetOptional<T, "id">;

export type ConfigurableLayerModelBase<T extends LayerModelBase> = Omit<
  ConfigurableLayerModel<T>,
  "type"
>;

export type LayerTitle = LayerListItemProps["title"];

export type LayerColorScheme = QuantitativeColorMap | QualitativeColorSet;

declare module "../layers" {
  interface LayerModelBase {
    titleAtom: PrimitiveAtom<LayerTitle | null>;
    loadingAtom: PrimitiveAtom<boolean>;
    hiddenAtom: PrimitiveAtom<boolean>;
    // NOTE: Use layerId instead of boundingSphereAtom for ReEarth
    layerIdAtom: PrimitiveAtom<string | null>;
    colorSchemeAtom: Atom<LayerColorScheme | null>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface LayerModelOverrides extends ReEarthLayerModelOverrides {}
}

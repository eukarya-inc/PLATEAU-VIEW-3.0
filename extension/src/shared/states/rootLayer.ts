import { PrimitiveAtom, atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { LayerModel } from "../../prototypes/layers";
import { sharedAtom, sharedStoreAtom, sharedStoreAtomWrapper } from "../sharedAtoms";
import { RootLayerConfig } from "../view-layers";

export const CURRENT_COMPONENT_GROUP_ID = "CURRENT_COMPONENT_GROUP_ID";
export const CURRENT_DATA_ID = "CURRENT_DATA_ID";

export const addedDatasetIdList = sharedStoreAtom(
  sharedAtom<string[]>("ADDED_DATASET_ID_LIST", []),
);

export const rootLayersBaseAtom = atomWithReset<RootLayerConfig[]>([]);
export const rootLayersAtom = sharedStoreAtomWrapper("ROOT_LAYERS", rootLayersBaseAtom);
export const rootLayersLayersAtom = atom<LayerModel[]>(get => {
  return get(rootLayersAtom).map(root => {
    const rootLayer = get(root.rootLayerAtom);
    return get(rootLayer.layer) as LayerModel;
  });
});
export const rootLayersLayerAtomsAtom = atom<PrimitiveAtom<LayerModel>[]>(get => {
  return get(rootLayersAtom).map(root => {
    const rootLayer = get(root.rootLayerAtom);
    return rootLayer.layer as PrimitiveAtom<LayerModel>;
  });
});

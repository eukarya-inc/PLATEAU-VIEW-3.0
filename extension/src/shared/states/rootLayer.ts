import { PrimitiveAtom, atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { LayerModel } from "../../prototypes/layers";
import { Setting } from "../api/types";
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

export const updateRootLayerBySetting = atom(undefined, (get, set, setting: Setting) => {
  const rootLayers = get(rootLayersAtom);
  const layer = rootLayers.find(l => l.id === setting.datasetId);
  if (!layer) {
    return;
  }
  const currentSettings = [...get(layer.settingsAtom)];
  const settingIndex = currentSettings.findIndex(c => c.id === setting.id);
  if (settingIndex === -1) {
    currentSettings.push(setting);
  } else {
    currentSettings[settingIndex] = setting;
  }
  set(layer.settingsAtom, currentSettings);
});

export const removeRootLayerBySetting = atom(undefined, (get, set, setting: Setting) => {
  const rootLayers = get(rootLayersAtom);
  const layer = rootLayers.find(l => l.id === setting.datasetId);
  if (!layer) {
    return;
  }
  set(
    layer.settingsAtom,
    get(layer.settingsAtom).filter(s => s.id !== setting.id),
  );
});

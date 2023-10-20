import { PrimitiveAtom, atom } from "jotai";
import { splitAtom } from "jotai/utils";

import { Setting } from "../api/types";

import { removeRootLayerBySetting, updateRootLayerBySetting } from "./rootLayer";

export const settingsAtom = atom<Setting[]>([]);
export const settingsAtomsAtom = splitAtom(settingsAtom);

export const addSettingAtom = atom(undefined, (_get, set, setting: Setting) => {
  set(updateRootLayerBySetting, setting);
  set(settingsAtomsAtom, {
    type: "insert",
    value: setting,
  });
});

export const removeSettingAtom = atom(undefined, (get, set, setting: PrimitiveAtom<Setting>) => {
  set(removeRootLayerBySetting, get(setting));
  set(settingsAtomsAtom, {
    type: "remove",
    atom: setting,
  });
});

export const updateSettingAtom = atom(undefined, (get, set, setting: Setting, index: number) => {
  set(updateRootLayerBySetting, setting);

  const settings = get(settingsAtomsAtom);
  const settingAtom = settings[index];
  set(settingAtom, setting);
});

export const filterSettingAtom = atom(
  undefined,
  (get, _set, filter: (setting: Setting) => boolean) => {
    return get(settingsAtomsAtom).filter(s => filter(get(s)));
  },
);

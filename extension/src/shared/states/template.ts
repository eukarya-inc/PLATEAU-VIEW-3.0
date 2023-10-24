import { PrimitiveAtom, atom } from "jotai";
import { splitAtom } from "jotai/utils";

import { Template } from "../api/types";

export const templatesAtom = atom<Template[]>([]);
export const templatesAtomsAtom = splitAtom(templatesAtom);

export const addTemplateAtom = atom(undefined, (_get, set, template: Template) => {
  set(templatesAtomsAtom, {
    type: "insert",
    value: template,
  });
});

export const removeTemplateAtom = atom(
  undefined,
  (_get, set, template: PrimitiveAtom<Template>) => {
    set(templatesAtomsAtom, {
      type: "remove",
      atom: template,
    });
  },
);

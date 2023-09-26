import { PrimitiveAtom, WritableAtom } from "jotai";
import invariant from "tiny-invariant";

import { Component, ComponentBase } from "../api/types";
import {
  sharedAtom,
  sharedAtomValue,
  sharedStoreAtom,
  sharedStoreAtomWrapper,
  storageStoreAtom,
  storageStoreAtomWrapper,
} from "../sharedAtoms";

export type WritableAtomForComponent<T> = WritableAtom<T, [update: T], void>;

export type ComponentAtom<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  type: Component<T>["type"];
  atom: WritableAtomForComponent<Component<T>["value"]>;
};

export type ComponentIdParams = {
  datasetId: string | undefined;
  shareId: string | undefined;
  componentType: string | undefined;
};

export const makeComponentId = ({ datasetId, componentType, shareId }: ComponentIdParams) => {
  let name = `${datasetId}_${componentType}`;
  if (shareId) {
    name += `_${shareId}`;
  }
  return name;
};

export const makeComponentAtomWrapper = <V>(
  a: PrimitiveAtom<V>,
  params: ComponentIdParams,
  storeable?: boolean,
) => {
  const name = makeComponentId(params);
  if (storeable) {
    return sharedStoreAtomWrapper(name, storageStoreAtomWrapper(name, a));
  }
  return sharedStoreAtomWrapper(name, a);
};

export const makeComponentAtoms = (
  datasetId: string | undefined,
  components: Component[],
  shareId: string | undefined,
): ComponentAtom[] => {
  invariant(datasetId);
  return components.map(component => {
    const name = makeComponentId({ datasetId, componentType: component.type, shareId });
    const a = sharedAtom(name, component.value);
    if (component.storeable) {
      return {
        type: component.type,
        atom: sharedAtomValue(sharedStoreAtom(storageStoreAtom(a))),
      };
    }
    return {
      type: component.type,
      atom: sharedAtomValue(sharedStoreAtom(a)),
    };
  });
};

export const filterComponent = <T extends ComponentBase["type"]>(
  components: ComponentBase[],
  filter: T[],
): Component<T>[] => {
  return components.filter(c => filter.includes(c.type as T)) as unknown as Component<T>[];
};

export const findComponentAtom = <T extends ComponentBase["type"]>(
  componentAtoms: ComponentAtom[],
  filter: Component<T>["type"],
): ComponentAtom<T> | undefined => {
  return componentAtoms.find(c => filter === c.type) as unknown as ComponentAtom<T>;
};

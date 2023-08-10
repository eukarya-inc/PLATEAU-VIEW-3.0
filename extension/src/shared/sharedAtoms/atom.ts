import { WritableAtom, atom } from "jotai";

import { receive } from "./receiver";
import { send } from "./sender";
import {
  getStateStoreValue,
  getStorageStoreValue,
  setSharedStoreValue,
  setStateStoreValue,
  setStorageStoreValue,
} from "./store";

type AtomValue<V> = { name: string; value: V };

type SharedAtom<V> = WritableAtom<AtomValue<V>, [update: (value: V, name: string) => V], void>;

export const sharedAtom = <V>(name: string, initialValue: V) => {
  const a = atom<AtomValue<V>>({ name, value: initialValue });
  a.onMount = set => {
    // Sync another widget's state
    const currentState = getStateStoreValue<V>(name);
    if (currentState) {
      set({ name, value: currentState });
    }
    receive<V>(name, async r => (r ? set({ name, value: r }) : undefined));
  };
  const wrapped = atom(
    get => get(a),
    (get, set, update: (value: V, name: string) => V) => {
      const { value } = get(a);
      const result = update(value, name);
      send(name, result);
      setStateStoreValue(name, result);
      set(a, { name, value: result });
    },
  );
  return wrapped;
};

// For the share feature
export const sharedStoreAtom = <V>(a: SharedAtom<V>) =>
  atom(
    get => get(a),
    (_get, set, update: (value: V, name: string) => V) => {
      set(a, (v, n) => {
        setSharedStoreValue(n, update(v, n));
        return update(v, n);
      });
    },
  );

// For the UI setting
export const storageStoreAtom = <V>(a: SharedAtom<V>) => {
  const wrapped = atom(
    get => get(a),
    (_get, set, update: (value: V, name: string) => V) => {
      set(a, (v, n) => {
        setStorageStoreValue(n, update(v, n));
        return update(v, n);
      });
    },
  );
  wrapped.onMount = set => {
    set((v, n) => getStorageStoreValue(n) ?? v);
  };
  return wrapped;
};

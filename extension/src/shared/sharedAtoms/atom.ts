import { WritableAtom, atom } from "jotai";

import {
  getSharedStoreValue,
  getStorageStoreValue,
  setSharedStoreValue,
  setStorageStoreValue,
} from "./store";

type AtomValue<V> = { name: string; value: V };

type SharedAtom<V> = WritableAtom<AtomValue<V>, [update: (value: V, name: string) => V], void>;

export const sharedAtom = <V>(name: string, initialValue: V) => {
  const a = atom<AtomValue<V>>({ name, value: initialValue });
  const wrapped = atom(
    get => get(a),
    (get, set, update: (value: V, name: string) => V) => {
      const { value } = get(a);
      const result = update(value, name);
      set(a, { name, value: result });
    },
  );
  return wrapped;
};

// For the share feature
export const sharedStoreAtom = <V>(a: SharedAtom<V>) => {
  const w = atom(
    get => get(a),
    (_get, set, update: (value: V, name: string) => V) => {
      set(a, (v, n) => {
        setSharedStoreValue(n, update(v, n));
        return update(v, n);
      });
    },
  );
  w.onMount = set => {
    set((_, n) => getSharedStoreValue(n) as V);
  };
  return w;
};

export const sharedStoreAtomWrapper = <V, A extends unknown[], S>(
  name: string,
  a: WritableAtom<V, A, S>,
) => {
  const w = atom(
    get => get(a),
    (_get, set, ...args: A) => {
      setSharedStoreValue(name, args);
      set(a, ...args);
    },
  );
  w.onMount = set => {
    getSharedStoreValue(name).then(v => {
      if (v) {
        set(...(v as A));
      }
    });
  };
  return w;
};

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

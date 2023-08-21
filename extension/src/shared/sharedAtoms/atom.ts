import { WritableAtom, atom } from "jotai";

import { getStorageStoreValue, setSharedStoreValue, setStorageStoreValue } from "./store";

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

import { Atom, atom, useAtomValue } from "jotai";
import { useMemo } from "react";

export const useOptionalAtom = <V>(valueAtom: Atom<V> | undefined) => {
  return useMemo(() => {
    return atom(get => {
      if (!valueAtom) {
        return;
      }
      return get(valueAtom);
    });
  }, [valueAtom]);
};

export const useOptionalAtomValue = <V>(valueAtom: Atom<V> | undefined) => {
  const result = useOptionalAtom(valueAtom);
  return useAtomValue(result);
};

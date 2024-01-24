import { atom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";

import { readyAtom } from "../../prototypes/view/states/app";
import { rootLayersLayersAtom } from "../../shared/states/rootLayer";

const INITIAL_LAYER_LENGTH = 3;

export const useLoading = () => {
  const setReady = useSetAtom(readyAtom);
  const layers = useAtomValue(rootLayersLayersAtom);

  const layerIds = useAtomValue(
    useMemo(() => {
      return atom(get => layers.map(layer => get(layer.layerIdAtom)));
    }, [layers]),
  );

  useEffect(() => {
    if (INITIAL_LAYER_LENGTH !== layerIds.length) return;
    setReady(true);
  }, [layerIds.length, setReady]);
};

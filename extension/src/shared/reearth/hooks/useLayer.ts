import { useEffect, useRef } from "react";

import { Events, LayerAppearanceTypes } from "../types";
import { Data } from "../types/layer";

export type LayerHookOptions = {
  data: Data;
  appearances: Partial<LayerAppearanceTypes>;
  visible?: boolean;
  events?: Events;
  onLoad?: (layerId: string) => void;
};

export const useLayer = ({ data, appearances, visible, events, onLoad }: LayerHookOptions) => {
  const layerIdRef = useRef<string>();

  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: data,
      events,
      ...appearances,
    });

    layerIdRef.current = layerId;

    return () => {
      if (!layerId) return;
      window.reearth?.layers?.delete?.(layerId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;

    window.reearth?.layers?.override?.(layerId, {
      data: data,
      visible,
      events,
      ...appearances,
    });
  }, [appearances, visible, data, events]);

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;
    setTimeout(() => {
      if (layerId) {
        onLoad?.(layerId);
      }
    }, 0);
  }, [onLoad, data.url]);
};

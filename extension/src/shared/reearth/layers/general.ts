import { FC, useEffect, useMemo, useRef } from "react";

import { LayerType } from "../../../prototypes/layers";
import { LayerAppearanceTypes, Events } from "../types";
import { DataType } from "../types/layer";

export const GENERAL_FEATURE = "GENERAL_FEATURE";
declare module "../../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [GENERAL_FEATURE]: {
      key: string;
      layerId: string;
      layerType: LayerType;
      datasetId: string;
    };
  }
}

export type General = {};
export type GeneralFeature<P> = {
  properties: P;
};

export type GeneralAppearances = Partial<LayerAppearanceTypes>;
export type GeneralData = 

export type GeneralProps = {
  url: string;
  format: DataType;
  onLoad?: (layerId: string) => void;
  show?: string | boolean;
  visible?: boolean;
  selectedFeatureColor?: string;
  appearances: GeneralAppearances;
  updateInterval?: number;
  events?: Events;
};

const DEFAULT_APPEARNACES: Partial<LayerAppearanceTypes> = {
  resource: {
    clampToGround: true,
  },
  marker: {
    heightReference: "clamp",
  },
  polyline: {
    clampToGround: true,
  },
  polygon: {
    heightReference: "clamp",
  },
};

export const GeneralLayer: FC<GeneralProps> = ({
  url,
  format,
  onLoad,
  visible,
  appearances,
  updateInterval,
  events,
  selectedFeatureColor,
}) => {
  const layerIdRef = useRef<string>();
  const mergedAppearances: Partial<LayerAppearanceTypes> | undefined = useMemo(
    () => ({
      ...appearances,
      resource: {
        ...DEFAULT_APPEARNACES.resource,
        ...(appearances.resource ?? {}),
      },
      marker: {
        ...DEFAULT_APPEARNACES.marker,
        ...(appearances.marker ?? {}),
      },
      polyline: {
        ...DEFAULT_APPEARNACES.polyline,
        ...(appearances.polyline ?? {}),
      },
      polygon: {
        ...DEFAULT_APPEARNACES.polygon,
        ...(appearances.polygon ?? {}),
      },
      "3dtiles": {
        selectedFeatureColor,
        ...(appearances["3dtiles"] ?? {}),
      },
    }),
    [appearances, selectedFeatureColor],
  );

  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: {
        type: format,
        url,
        updateInterval,
      },
      events,
      ...mergedAppearances,
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
      data: {
        type: format,
        url,
        updateInterval,
      },
      events: events ?? {},
      visible,
      ...mergedAppearances,
    });
  }, [mergedAppearances, visible, format, url, events, updateInterval]);

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;
    setTimeout(() => {
      if (layerId) {
        onLoad?.(layerId);
      }
    }, 0);
  }, [onLoad, url]);

  return null;
};

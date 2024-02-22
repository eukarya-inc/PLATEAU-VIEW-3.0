import { useAtomValue } from "jotai";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { updateOrderAtom } from "../../../prototypes/view-layers";
import { useLayer } from "../hooks";
import { CameraPosition, LayerAppearanceTypes } from "../types";
import { Data } from "../types/layer";

export type MVTAppearances = Partial<
  Pick<LayerAppearanceTypes, "raster" | "marker" | "polygon" | "polyline">
>;

export type MVTProps = {
  url: string;
  onLoad?: (layerId: string, camera: CameraPosition) => void;
  visible?: boolean;
  appearances?: MVTAppearances;
  layers?: string[];
  index?: number;
};

const DEFAULT_APPEARNACES: Partial<LayerAppearanceTypes> = {
  raster: {},
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

type RawMVTMeta = {
  name: string;
  description: string;
  version: number;
  minzoom: number;
  maxzoom: number;
  center: `${number},${number},${number}`;
  bounds: `${number},${number},${number}`;
  type: "overlay";
  format: "pbr";
};

type MVTMeta = Omit<RawMVTMeta, "center" | "bounds"> & {
  center: [lng: number, lat: number, z: number];
  bounds: [x: number, y: number, z: number];
};

export const MVTLayer: FC<MVTProps> = ({ url, onLoad, visible, appearances, layers, index }) => {
  const [meta, setMeta] = useState<MVTMeta | undefined>();
  const updateOrder = useAtomValue(updateOrderAtom);
  useEffect(() => {
    const fetchMVTMeta = async () => {
      const mvtBaseURL = url.match(/(.+)(\/{z}\/{x}\/{y}.mvt)/)?.[1];
      if (!mvtBaseURL) return;

      const data = await fetch(`${mvtBaseURL}/metadata.json`)
        .then(d => d.json())
        .then(d => d as RawMVTMeta)
        .catch(() => undefined);
      if (!data) return;

      const center = data?.center?.split(",")?.map((s: string) => Number(s));
      if (!center || center.length < 2) return;
      const bounds = data?.bounds?.split(",")?.map((s: string) => Number(s));
      if (!bounds || bounds.length < 2) return;

      setMeta({
        ...data,
        center: center as [lng: number, lat: number, z: number],
        bounds: bounds as [lng: number, lat: number, z: number],
      });
    };

    fetchMVTMeta();
  }, [url]);

  const mergedAppearances: MVTAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      marker: {
        ...DEFAULT_APPEARNACES.marker,
        ...(appearances?.marker ?? {}),
      },
      polyline: {
        ...DEFAULT_APPEARNACES.polyline,
        ...(appearances?.polyline ?? {}),
      },
      polygon: {
        ...DEFAULT_APPEARNACES.polygon,
        ...(appearances?.polygon ?? {}),
      },
      raster: {
        maximumLevel: meta?.maxzoom,
        hideIndicator: true,
      },
    }),
    [appearances, meta],
  );

  const data: Data = useMemo(
    () => ({
      type: "mvt",
      url,
      layers,
      jsonProperties: ["attributes"],
    }),
    [url, layers],
  );

  const prevIndexRef = useRef<number>();
  const preUpdateOrder = useRef<number>();
  const handleOnLoad = useCallback(
    (layerId: string) => {
      if (!meta) return;
      if (layerId && prevIndexRef.current !== undefined && index !== undefined) {
        if (
          index < prevIndexRef.current ||
          (index < 1 && preUpdateOrder.current !== updateOrder && visible)
        ) {
          window.reearth?.layers?.bringToFront?.(layerId);
        }
      }
      prevIndexRef.current = index;

      preUpdateOrder.current = updateOrder;
      onLoad?.(layerId, {
        lng: meta.center[0],
        lat: meta.center[1],
        height: 30000,
        pitch: -(Math.PI / 2),
        heading: 0,
        roll: 0,
      });
    },
    [index, meta, onLoad, updateOrder, visible],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad: handleOnLoad,
    loading: !meta,
  });

  return null;
};

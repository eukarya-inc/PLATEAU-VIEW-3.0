import { atom } from "jotai";

import { isNotNullish } from "../../prototypes/type-helpers";
import {
  HEATMAP_LAYER,
  HeatmapLayerModel,
  MY_DATA_LAYER,
  PEDESTRIAN_LAYER,
  PedestrianLayerModel,
  SharedHeatmapLayer,
  SharedPedestrianLayer,
} from "../../prototypes/view-layers";
import { getSharedStoreValue, setSharedStoreValue } from "../sharedAtoms/store";
import { MyDataLayerModel, SharedMyDataLayer } from "../view-layers";

import { rootLayersAtom } from "./rootLayer";
import { sharedInitialCameraAtom, sharedInitialClockAtom } from "./scene";

export const shareAtom = atom(undefined, async (_get, set) => {
  set(sharedInitialClockAtom, async () => window.reearth?.clock?.currentTime?.getTime());
  set(sharedInitialCameraAtom, async () => window.reearth?.camera?.position);
  set(shareRootLayerAtom);
});

export type SharedRootLayer =
  | {
      type: "dataset";
      datasetId: string;
      dataId: string | undefined;
    }
  | SharedHeatmapLayer
  | SharedPedestrianLayer
  | SharedMyDataLayer;

// For share feature
const SHARED_LAYERS_KEY = "$sharedLayers";
const shareRootLayerAtom = atom(undefined, get => {
  const rootLayers: SharedRootLayer[] = get(rootLayersAtom)
    .map((r): SharedRootLayer | undefined => {
      switch (r.type) {
        case "dataset":
          return {
            type: "dataset",
            datasetId: r.id,
            dataId: get(r.currentDataIdAtom),
          };
        case "layer": {
          const rootLayer = get(r.rootLayerAtom);
          const layer = get(rootLayer.layer);
          switch (layer.type) {
            case HEATMAP_LAYER: {
              const l = layer as HeatmapLayerModel;
              return {
                type: "heatmap",
                datasetId: l.datasetId,
                dataId: l.dataId,
              };
            }
            case PEDESTRIAN_LAYER: {
              const l = layer as PedestrianLayerModel;
              return {
                type: "pedestrian",
                id: l.id,
              };
            }
            case MY_DATA_LAYER: {
              const l = layer as MyDataLayerModel;
              return {
                type: "myData",
                id: l.id,
                title: l.title,
                url: l.url,
                format: l.format,
                layers: l.layers,
                csv: l.csv,
              };
            }
          }
        }
      }
    })
    .filter(isNotNullish);
  setSharedStoreValue(SHARED_LAYERS_KEY, rootLayers);
});
export const getSharedRootLayersAtom = atom(undefined, () => {
  return getSharedStoreValue<SharedRootLayer[]>(SHARED_LAYERS_KEY);
});

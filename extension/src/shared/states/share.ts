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
import { generateID } from "../utils";
import { MyDataLayerModel, SharedMyDataLayer } from "../view-layers";

import { rootLayersAtom } from "./rootLayer";
import { sharedInitialCameraAtom, sharedInitialClockAtom } from "./scene";

// This is necessary to identify the shared state.
export const SHARED_PROJECT_ID = generateID();
export const SHARED_PROJECT_ID_KEY = "sharedProjectId";

export const shareAtom = atom(undefined, async (_get, set) => {
  await set(sharedInitialClockAtom, async () => window.reearth?.clock?.currentTime?.getTime());
  await set(sharedInitialCameraAtom, async () => window.reearth?.camera?.position);
  await set(shareRootLayerAtom);
  await setSharedStoreValue(
    SHARED_PROJECT_ID_KEY,
    (await getSharedStoreValue(SHARED_PROJECT_ID_KEY)) ?? SHARED_PROJECT_ID,
  );
});

export type SharedRootLayer =
  | {
      type: "dataset";
      datasetId: string;
      dataId: string | undefined;
      groupId: string | undefined;
    }
  | SharedHeatmapLayer
  | SharedPedestrianLayer
  | SharedMyDataLayer;

// For share feature
const SHARED_LAYERS_KEY = "$sharedLayers";
const shareRootLayerAtom = atom(undefined, async get => {
  const rootLayers: SharedRootLayer[] = get(rootLayersAtom)
    .map((r): SharedRootLayer | undefined => {
      switch (r.type) {
        case "dataset":
          return {
            type: "dataset",
            datasetId: r.id,
            dataId: get(r.currentDataIdAtom),
            groupId: get(r.currentGroupIdAtom),
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
  await setSharedStoreValue(SHARED_LAYERS_KEY, rootLayers);
});
export const getSharedRootLayersAtom = atom(undefined, () => {
  return getSharedStoreValue<SharedRootLayer[]>(SHARED_LAYERS_KEY);
});

// import { pedestrianSelectionAtom } from "../pedestrian";
import { atom } from "jotai";
import { fromPairs, uniq, without } from "lodash-es";
import invariant from "tiny-invariant";

import { rootLayersAtom, rootLayersLayersAtom } from "../../shared/states/rootLayer";
import { RootLayerAtom } from "../../shared/view-layers";
import { parseIdentifier } from "../cesium-helpers";
import { featureSelectionAtom } from "../datasets";
import { LayerModel } from "../layers";
import { PEDESTRIAN_OBJECT } from "../pedestrian";
import { screenSpaceSelectionAtom } from "../screen-space-selection";
import { atomsWithSelection } from "../shared-states";
import { isNotNullish } from "../type-helpers";

import { PEDESTRIAN_LAYER } from "./layerTypes";

// import { PEDESTRIAN_LAYER } from "./layerTypes";
// import { type PedestrianLayerModel } from "./PedestrianLayer";

export const pixelRatioAtom = atom(1);

// TODO(ReEarth): Support selected feature
export const tilesetLayersAtom = atom(get =>
  get(rootLayersAtom).filter(layer => get(get(layer.rootLayerAtom as RootLayerAtom).layer)),
);

export const tilesetLayersLayersAtom = atom(get =>
  get(rootLayersAtom).map(layer => get(get(layer.rootLayerAtom as RootLayerAtom).layer)),
);

// export const pedestrianLayersAtom = atom(get =>
//   get(layersAtom).filter((layer): layer is PedestrianLayerModel => layer.type === PEDESTRIAN_LAYER),
// );

export const highlightedTilesetLayersAtom = atom(get => {
  const featureKeys = get(featureSelectionAtom).map(({ value }) => value);
  const tilesetLayers = get(tilesetLayersAtom);
  return tilesetLayers.filter(root => {
    const layer = get(get(root.rootLayerAtom as RootLayerAtom).layer);
    if (!("featureIndexAtom" in layer)) {
      return;
    }
    const featureIndex = get(layer.featureIndexAtom);
    const features = featureIndex?.featureIds;
    return features && featureKeys.some(key => features.includes(key.key));
  });
});

// export const highlightedPedestrianLayersAtom = atom(get => {
//   const entityIds = get(pedestrianSelectionAtom).map(({ value }) => value);
//   const pedestrianLayers = get(pedestrianLayersAtom);
//   return pedestrianLayers.filter(layer => {
//     const id = compose({ type: "Pedestrian", key: layer.id });
//     return entityIds.some(entityId => entityId === id);
//   });
// });

export const highlightedLayersAtom = atom(get => {
  const screenSpaceSelection = get(screenSpaceSelectionAtom);
  const layers = get(rootLayersLayersAtom);
  const result: LayerModel[] = [];
  for (const layer of layers) {
    const layerId = get(layer.layerIdAtom);
    const selection = screenSpaceSelection.some(v => {
      switch (v.type) {
        case PEDESTRIAN_OBJECT:
          return layer.type === PEDESTRIAN_LAYER && layer.id === parseIdentifier(v.value).key;
        default:
          return layerId === v.value.layerId;
      }
    });
    if (selection) {
      result.push(layer);
    }
  }

  return result;
});

export const featureIndicesAtom = atom(get => {
  const layers = get(tilesetLayersAtom);
  return fromPairs(
    layers
      .map(root => {
        const layer = get(get(root.rootLayerAtom as RootLayerAtom).layer);
        const layerId = get(layer.layerIdAtom);
        if (!("featureIndexAtom" in layer)) {
          return;
        }
        const featureIndex = get(layer.featureIndexAtom);
        return featureIndex != null ? [layerId, featureIndex] : undefined;
      })
      .filter(isNotNullish),
  );
});

// export const findFeaturesAtom = atom(null, (get, _set, key: string) => {
//   const indices = get(featureIndicesAtom);
//   for (const [layerId, index] of Object.entries(indices)) {
//     const features = index.find(key);
//     if (features != null) {
//       return { layerId, features };
//     }
//   }
//   return undefined;
// });

export const hideFeaturesAtom = atom(null, (get, set, value: readonly string[] | null) => {
  const layers = get(tilesetLayersAtom);
  layers.forEach(root => {
    const layer = get(get(root.rootLayerAtom as RootLayerAtom).layer);
    if (!("hiddenFeaturesAtom" in layer)) {
      return;
    }
    const { layerIdAtom, hiddenFeaturesAtom } = layer;
    const layerId = get(layerIdAtom);
    invariant(layerId);
    const featureIndex = get(featureIndicesAtom)[layerId];
    const nextValue = value?.filter(value => featureIndex.has(value));
    set(hiddenFeaturesAtom, prevValue =>
      prevValue != null || nextValue != null
        ? uniq([...(prevValue ?? []), ...(nextValue ?? [])])
        : null,
    );
  });
});

export const showFeaturesAtom = atom(null, (get, set, value: readonly string[] | null) => {
  const layers = get(tilesetLayersAtom);
  layers.forEach(root => {
    const layer = get(get(root.rootLayerAtom as RootLayerAtom).layer);
    if (!("hiddenFeaturesAtom" in layer)) {
      return;
    }
    const { hiddenFeaturesAtom } = layer;
    set(hiddenFeaturesAtom, prevValue => {
      if (value == null) {
        return null;
      }
      const nextValue = without(prevValue, ...value);
      return nextValue.length === prevValue?.length
        ? prevValue
        : nextValue.length > 0
        ? nextValue
        : null;
    });
  });
});

export const showAllFeaturesAtom = atom(null, (get, set) => {
  const layers = get(tilesetLayersAtom);
  layers.forEach(root => {
    const layer = get(get(root.rootLayerAtom as RootLayerAtom).layer);
    if (!("hiddenFeaturesAtom" in layer)) {
      return;
    }
    const { hiddenFeaturesAtom } = layer;
    set(hiddenFeaturesAtom, null);
  });
});

const {
  selectionAtom: colorSchemeSelectionAtom,
  addAtom: addColorSchemeSelectionAtom,
  removeAtom: removeColorSchemeSelectionAtom,
  clearAtom: clearColorSchemeSelectionAtom,
} = atomsWithSelection<string>();

export {
  colorSchemeSelectionAtom,
  addColorSchemeSelectionAtom,
  removeColorSchemeSelectionAtom,
  clearColorSchemeSelectionAtom,
};

const {
  selectionAtom: imageSchemeSelectionAtom,
  addAtom: addImageSchemeSelectionAtom,
  removeAtom: removeImageSchemeSelectionAtom,
  clearAtom: clearImageSchemeSelectionAtom,
} = atomsWithSelection<string>();

export {
  imageSchemeSelectionAtom,
  addImageSchemeSelectionAtom,
  removeImageSchemeSelectionAtom,
  clearImageSchemeSelectionAtom,
};

import jismesh from "jismesh-js";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { FC, useCallback, useState } from "react";

import { composeIdentifier } from "../../prototypes/cesium-helpers";
import { LayerModel, layerSelectionAtom, useAddLayer } from "../../prototypes/layers";
import { screenSpaceSelectionAtom } from "../../prototypes/screen-space-selection";
import { meshCodeTypeAtom } from "../../prototypes/view/states/tool";
import { highlightedMeshCodeLayersAtom, MESH_CODE_LAYER } from "../../prototypes/view-layers";
import { useReEarthEvent } from "../reearth/hooks";
import { MeshCodeIndicator } from "../reearth/layers";
import { MouseEvent } from "../reearth/types";
import { rootLayersLayersAtom } from "../states/rootLayer";
import { createRootLayerForLayerAtom } from "../view-layers";

import { MESH_CODE_OBJECT, MeshCodeFeature } from "./types";
import { getCoordinatesFromMeshCode, getMeshCodeLevelByType } from "./utils";

const targetMeshCodeLayerAtom = atom<LayerModel<typeof MESH_CODE_LAYER> | null>(get => {
  const layers = get(rootLayersLayersAtom);
  const selection = get(layerSelectionAtom);
  const selectedMeshCodeLayers = layers.filter(
    (layer): layer is LayerModel<typeof MESH_CODE_LAYER> =>
      layer.type === MESH_CODE_LAYER && selection.map(s => s.id).includes(layer.id),
  );
  const highlightedMeshCodeLayers = get(highlightedMeshCodeLayersAtom);
  if (selectedMeshCodeLayers.length === 0) {
    return highlightedMeshCodeLayers[0] ?? null;
  }
  return selectedMeshCodeLayers[0] ?? null;
});

const existMeshCodeFeaturesAtom = atom(get => {
  const layer = get(targetMeshCodeLayerAtom);
  return layer?.featuresAtom ? get(layer.featuresAtom) : [];
});

const addFeatureAtom = atom(null, (get, set, value: MeshCodeFeature) => {
  const layer = get(targetMeshCodeLayerAtom);
  if (layer == null) {
    return;
  }
  set(layer.featureAtomsAtom, {
    type: "insert",
    value,
  });
});

const MeshCodeDrawer: FC = () => {
  const layer = useAtomValue(targetMeshCodeLayerAtom);
  const addFeature = useSetAtom(addFeatureAtom);
  const addLayer = useAddLayer();
  const setScreenSpaceSelection = useSetAtom(screenSpaceSelectionAtom);

  const existFeatures = useAtomValue(existMeshCodeFeaturesAtom);

  const handleCreate = useCallback(
    (meshCode: string) => {
      if (existFeatures?.some(f => f.meshCode === meshCode)) {
        return;
      }

      const id = nanoid();
      const feature: MeshCodeFeature = {
        id,
        meshCode,
      };
      if (layer != null) {
        addFeature(feature);
      } else {
        const layer = createRootLayerForLayerAtom({
          id,
          type: MESH_CODE_LAYER,
          features: [feature],
        });
        addLayer(layer, { autoSelect: false });
      }

      setTimeout(() => {
        setScreenSpaceSelection([
          {
            type: MESH_CODE_OBJECT,
            value: composeIdentifier({
              type: "MeshCode",
              subtype: MESH_CODE_OBJECT,
              key: feature.id,
            }),
          },
        ]);
      }, 120);
    },
    [addFeature, addLayer, setScreenSpaceSelection, layer, existFeatures],
  );

  const [meshCodeType] = useAtom(meshCodeTypeAtom);
  const [coordinates, setCoordinates] = useState<[number, number][][] | undefined>();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!e.lat || !e.lng) return;
      const meshCode = jismesh.toMeshCode(e.lat, e.lng, getMeshCodeLevelByType(meshCodeType));
      if (!meshCode) return;
      setCoordinates(getCoordinatesFromMeshCode(meshCode));
    },
    [meshCodeType],
  );

  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (!e.lat || !e.lng) return;
      const meshCode = jismesh.toMeshCode(e.lat, e.lng, getMeshCodeLevelByType(meshCodeType));
      if (!meshCode) return;
      handleCreate(meshCode);
    },
    [meshCodeType, handleCreate],
  );

  useReEarthEvent("mousemove", handleMouseMove);
  useReEarthEvent("click", handleMouseClick);

  return coordinates ? <MeshCodeIndicator coordinates={coordinates} /> : null;
};

export default MeshCodeDrawer;

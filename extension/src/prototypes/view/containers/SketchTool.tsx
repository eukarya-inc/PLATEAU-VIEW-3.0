import { atom, useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useCallback, type FC } from "react";

import { useReEarthEvent } from "../../../shared/reearth/hooks";
import { ReearthSketchType } from "../../../shared/reearth/types";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { createRootLayerForLayerAtom } from "../../../shared/view-layers";
import { composeIdentifier } from "../../cesium-helpers";
import { LayerModel, layerSelectionAtom, useAddLayer } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { SKETCH_OBJECT, SketchGeometryType, type SketchFeature } from "../../sketch";
import { SKETCH_LAYER, highlightedSketchLayersAtom } from "../../view-layers";
import { modalToolAtom, toolAtom } from "../states/tool";

const targetSketchLayerAtom = atom<LayerModel<typeof SKETCH_LAYER> | null>(get => {
  const layers = get(rootLayersLayersAtom);
  const selection = get(layerSelectionAtom);
  const selectedSketchLayers = layers.filter(
    (layer): layer is LayerModel<typeof SKETCH_LAYER> =>
      layer.type === SKETCH_LAYER && selection.map(s => s.id).includes(layer.id),
  );
  const highlightedSketchLayers = get(highlightedSketchLayersAtom);
  if (selectedSketchLayers.length === 0) {
    return highlightedSketchLayers[0] ?? null;
  }
  return selectedSketchLayers[0] ?? null;
});

const addFeatureAtom = atom(null, (get, set, value: SketchFeature) => {
  const layer = get(targetSketchLayerAtom);
  if (layer == null) {
    return;
  }
  set(layer.featureAtomsAtom, {
    type: "insert",
    value,
  });
});

const Wrapped: FC = () => {
  const layer = useAtomValue(targetSketchLayerAtom);
  const addFeature = useSetAtom(addFeatureAtom);
  const addLayer = useAddLayer();
  const setScreenSpaceSelection = useSetAtom(screenSpaceSelectionAtom);

  const handleCreate = useCallback(
    (feature: SketchFeature) => {
      const id = nanoid();
      if (layer != null) {
        addFeature(feature);
      } else {
        const layer = createRootLayerForLayerAtom({
          id,
          type: SKETCH_LAYER,
          features: [feature],
        });
        addLayer(layer, { autoSelect: false });
      }
      setScreenSpaceSelection([
        {
          type: SKETCH_OBJECT,
          value: composeIdentifier({
            type: "Sketch",
            subtype: SKETCH_OBJECT,
            key: feature.properties.id,
          }),
        },
      ]);
    },
    [layer, addFeature, addLayer, setScreenSpaceSelection],
  );

  const toolType = useAtomValue(toolAtom);

  useReEarthEvent("sketchfeaturecreated", e => {
    if (toolType?.type === "sketch" && e.feature) {
      const convertedType = reearthSketchTypeToSketchGeometryType(e.feature.properties.type);
      handleCreate({ ...e.feature, properties: { ...e.feature.properties, type: convertedType } });
    }
  });

  return null;
};

export const SketchTool: FC = () => {
  const tool = useAtomValue(modalToolAtom);
  if (tool?.type !== "sketch") {
    return null;
  }
  return <Wrapped />;
};

function reearthSketchTypeToSketchGeometryType(
  type: ReearthSketchType | undefined,
): SketchGeometryType | undefined {
  switch (type) {
    case "extrudedCircle":
      return "circle";
    case "extrudedRectangle":
      return "rectangle";
    case "extrudedPolygon":
      return "polygon";
    default:
      return undefined;
  }
}

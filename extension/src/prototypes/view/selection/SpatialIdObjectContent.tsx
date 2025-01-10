import { Divider, IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { uniq } from "lodash";
import { FC, useCallback, useMemo } from "react";

import { SPATIAL_ID_OBJECT } from "../../../shared/spatialId";
import { parseIdentifier } from "../../cesium-helpers";
import { layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { isNotNullish } from "../../type-helpers";
import {
  InspectorHeader,
  InspectorItem,
  LayerIcon,
  ParameterList,
  PropertyParameterItem,
  SketchPolygonIcon,
  TrashIcon,
} from "../../ui-components";
import { highlightedSpatialIdLayersAtom, SPATIAL_ID_LAYER } from "../../view-layers";
import { SCREEN_SPACE_SELECTION, SelectionGroup } from "../states/selection";

export interface SpatialIdObjectContentProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof SPATIAL_ID_OBJECT;
  })["values"];
}

export const SpatialIdObjectContent: FC<SpatialIdObjectContentProps> = ({ values }) => {
  const setSelection = useSetAtom(screenSpaceSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const spatialIdLayers = useAtomValue(highlightedSpatialIdLayersAtom);
  const setLayerSelection = useSetAtom(layerSelectionAtom);
  const handleSelectLayers = useCallback(() => {
    setLayerSelection(spatialIdLayers.map(layer => ({ id: layer.id, type: SPATIAL_ID_LAYER })));
  }, [spatialIdLayers, setLayerSelection]);

  const removeFeatures = useSetAtom(
    useMemo(
      () =>
        atom(null, (get, set, featureIds: readonly string[]) => {
          spatialIdLayers.forEach(spatialIdLayer => {
            const featureAtoms = get(spatialIdLayer.featureAtomsAtom);
            featureIds.forEach(featureId => {
              const featureAtom = featureAtoms.find(
                featureAtom => get(featureAtom).id === featureId,
              );
              if (featureAtom != null) {
                set(spatialIdLayer.featureAtomsAtom, {
                  type: "remove",
                  atom: featureAtom,
                });
              }
            });
          });
        }),
      [spatialIdLayers],
    ),
  );
  const handleRemove = useCallback(() => {
    const featureIds = uniq(values.map(value => parseIdentifier(value).key).filter(isNotNullish));
    removeFeatures(featureIds);
    setSelection([]);
  }, [values, removeFeatures, setSelection]);

  const features = useAtomValue(spatialIdLayers[0].featuresAtom);

  const properties = useMemo(() => {
    const feature = features.find(feature => parseIdentifier(values[0]).key === feature.id);
    if (!feature) return [];
    return [
      {
        id: "spaceId",
        name: "空間ID",
        values: [feature.data.id],
      },
      {
        id: "spaceIdZoom",
        name: "Resolution",
        values: [feature.data.zoom],
      },
      {
        id: "spaceIdZoomZFXY",
        name: "ZFXY",
        values: [feature.data.zfxyStr],
      },
    ];
  }, [features, values]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={`${values.length}個の空間`}
        iconComponent={SketchPolygonIcon}
        actions={
          <>
            <Tooltip title="レイヤーを選択">
              <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
                <LayerIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="削除">
              <IconButton aria-label="削除" onClick={handleRemove}>
                <TrashIcon />
              </IconButton>
            </Tooltip>
          </>
        }
        onClose={handleClose}
      />
      <Divider />
      <InspectorItem>
        <ParameterList>
          <PropertyParameterItem properties={properties} featureType="spatialId" />
        </ParameterList>
      </InspectorItem>
    </List>
  );
};

import { Divider, IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { uniq } from "lodash-es";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import ReactJson from "react-json-view";

import { cityGMLClient } from "../../../shared/api/citygml";
import { MESH_CODE_OBJECT } from "../../../shared/meshCode";
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
  TrashIcon,
} from "../../ui-components";
import { highlightedMeshCodeLayersAtom, MESH_CODE_LAYER } from "../../view-layers";
import { SCREEN_SPACE_SELECTION, SelectionGroup } from "../states/selection";

export interface MeshCodeObjectContentProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof MESH_CODE_OBJECT;
  })["values"];
}

export const MeshCodeObjectContent: FC<MeshCodeObjectContentProps> = ({ values }) => {
  const setSelection = useSetAtom(screenSpaceSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const meshCodeLayers = useAtomValue(highlightedMeshCodeLayersAtom);
  const setLayerSelection = useSetAtom(layerSelectionAtom);
  const handleSelectLayers = useCallback(() => {
    setLayerSelection(meshCodeLayers.map(layer => ({ id: layer.id, type: MESH_CODE_LAYER })));
  }, [meshCodeLayers, setLayerSelection]);

  const removeFeatures = useSetAtom(
    useMemo(
      () =>
        atom(null, (get, set, featureIds: readonly string[]) => {
          meshCodeLayers.forEach(meshCodeLayer => {
            const featureAtoms = get(meshCodeLayer.featureAtomsAtom);
            featureIds.forEach(featureId => {
              const featureAtom = featureAtoms.find(
                featureAtom => get(featureAtom).id === featureId,
              );
              if (featureAtom != null) {
                set(meshCodeLayer.featureAtomsAtom, {
                  type: "remove",
                  atom: featureAtom,
                });
              }
            });
          });
        }),
      [meshCodeLayers],
    ),
  );
  const handleRemove = useCallback(() => {
    const featureIds = uniq(values.map(value => parseIdentifier(value).key).filter(isNotNullish));
    removeFeatures(featureIds);
    setSelection([]);
  }, [values, removeFeatures, setSelection]);

  const features = useAtomValue(meshCodeLayers[0].featuresAtom);

  const properties = useMemo(() => {
    const feature = features.find(feature => parseIdentifier(values[0]).key === feature.id);
    if (!feature) return [];
    return [
      {
        id: "meshCode",
        name: "メッシュコード",
        values: [feature.meshCode],
      },
    ];
  }, [features, values]);

  const [files, setFiles] = useState<object | undefined>();
  const [_loading, setLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);
  const meshCode = useMemo(() => {
    const feature = features.find(feature => parseIdentifier(values[0]).key === feature.id);
    if (!feature) return;
    return feature.meshCode;
  }, [features, values]);

  useEffect(() => {
    if (!meshCode) {
      setFiles(undefined);
      setLoading(false);
      setError(null);
      return;
    }
    const fetchFiles = async () => {
      setLoading(true);
      setFiles(undefined);
      setError(null);

      try {
        const data = await cityGMLClient?.getFiles({ meshId: meshCode });
        setFiles(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [meshCode]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={`${values.length}個のメッシュコレクション`}
        iconComponent={LayerIcon}
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
          <PropertyParameterItem properties={properties} featureType="meshCode" />
        </ParameterList>
        {files && (
          <ReactJson
            src={files}
            displayDataTypes={false}
            enableClipboard={false}
            displayObjectSize={false}
            quotesOnKeys={false}
            indentWidth={2}
            style={{ wordBreak: "break-all", lineHeight: 1.2 }}
          />
        )}
      </InspectorItem>
    </List>
  );
};

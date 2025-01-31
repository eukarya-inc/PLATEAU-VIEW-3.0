import { Divider, IconButton, List, styled, Tooltip } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { uniq } from "lodash-es";
import { FC, useCallback, useMemo } from "react";

import useCityGMLFiles from "../../../shared/api/citygml/hooks/useCityGMLFiles";
import useCityGMLPacks from "../../../shared/api/citygml/hooks/useCityGMLPacks";
import { DEFAULT_PLATEAU_SPEC_VERSION } from "../../../shared/constants";
import { useOptionalAtomValue } from "../../../shared/hooks";
import { MESH_CODE_OBJECT } from "../../../shared/meshCode";
import { parseIdentifier } from "../../cesium-helpers";
import { layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { isNotNullish } from "../../type-helpers";
import {
  InspectorHeader,
  LayerIcon,
  ParameterList,
  PropertyParameterItem,
  TrashIcon,
  PropertyActionItem,
  PackageIcon,
  DownloadIcon,
  LoadingAnimationIcon,
  PackageWarningIcon,
} from "../../ui-components";
import { highlightedMeshCodeLayersAtom, MESH_CODE_LAYER } from "../../view-layers";
import { SCREEN_SPACE_SELECTION, SelectionGroup } from "../states/selection";

const LoadingIconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
}));

const LoadingWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

const PropertyActionsWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

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

  const features = useOptionalAtomValue(meshCodeLayers[0]?.featuresAtom);

  const meshCodeProperties = useMemo(() => {
    const feature = features?.find(feature => parseIdentifier(values[0]).key === feature.id);
    if (!feature) return [];
    return [
      {
        id: "meshCode",
        name: "メッシュコード",
        values: [feature.meshCode],
      },
    ];
  }, [features, values]);

  const meshCodes = useMemo(() => {
    const feature = features?.find(feature => parseIdentifier(values[0]).key === feature.id);
    if (!feature) return [];
    return [feature.meshCode];
  }, [features, values]);

  const { cityNames, loading, data } = useCityGMLFiles({
    meshIdsStrict: meshCodes,
  });

  const { packs, handlePacking, handleDownloadPack } = useCityGMLPacks({ data });

  const cityProperties = useMemo(() => {
    return [
      {
        id: "cityNames",
        name: "関連市区町村",
        values: cityNames ?? [],
      },
    ];
  }, [cityNames]);

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
      <ParameterList>
        <PropertyParameterItem
          properties={meshCodeProperties}
          featureType="tags"
          version={DEFAULT_PLATEAU_SPEC_VERSION}
        />
        {loading ? (
          <LoadingWrapper>
            <LoadingAnimationIcon size={16} />
          </LoadingWrapper>
        ) : (
          <>
            {cityProperties[0].values.length > 0 && (
              <>
                <Divider />
                <PropertyParameterItem
                  properties={cityProperties}
                  featureType="tags"
                  version={DEFAULT_PLATEAU_SPEC_VERSION}
                />
              </>
            )}
            {packs.length > 0 && (
              <>
                <Divider />
                <PropertyActionsWrapper>
                  {packs.map(item => (
                    <PropertyActionItem key={item.id} name={item.name}>
                      {item.status === "idle" && (
                        <Tooltip title="Pack">
                          <IconButton
                            aria-label="Pack"
                            onClick={() => handlePacking(item.id)}
                            size="small">
                            <PackageIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.status === "retry" && (
                        <Tooltip title="Something wrong happened, click icon to pack again">
                          <IconButton
                            aria-label="Retry"
                            onClick={() => handlePacking(item.id)}
                            size="small">
                            <PackageWarningIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(item.status === "requesting" || item.status === "polling") && (
                        <LoadingIconWrapper>
                          <LoadingAnimationIcon size={16} />
                        </LoadingIconWrapper>
                      )}
                      {item.status === "packed" && (
                        <Tooltip title="Download">
                          <IconButton
                            aria-label="Download"
                            onClick={() => handleDownloadPack(item.id)}
                            size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </PropertyActionItem>
                  ))}
                </PropertyActionsWrapper>
              </>
            )}
          </>
        )}
      </ParameterList>
    </List>
  );
};

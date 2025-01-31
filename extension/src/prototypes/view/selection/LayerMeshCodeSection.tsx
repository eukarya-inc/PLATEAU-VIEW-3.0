import { Divider, IconButton, styled, Tooltip } from "@mui/material";
import { FC, useMemo } from "react";

import useCityGMLFiles from "../../../shared/api/citygml/hooks/useCityGMLFiles";
import useCityGMLPacks from "../../../shared/api/citygml/hooks/useCityGMLPacks";
import { DEFAULT_PLATEAU_SPEC_VERSION } from "../../../shared/constants";
import { useOptionalAtomValue } from "../../../shared/hooks";
import { LayerModel } from "../../layers";
import {
  DownloadIcon,
  LoadingAnimationIcon,
  PackageIcon,
  ParameterList,
  PropertyActionItem,
  PropertyParameterItem,
} from "../../ui-components";
import { MESH_CODE_LAYER } from "../../view-layers";

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

export interface LayerMeshCodeSectionProps {
  layers: readonly LayerModel[];
}

export const LayerMeshCodeSection: FC<LayerMeshCodeSectionProps> = ({ layers }) => {
  const meshCodeLayers = useMemo(
    () =>
      layers.filter(
        (layer): layer is LayerModel<typeof MESH_CODE_LAYER> => layer.type === MESH_CODE_LAYER,
      ),
    [layers],
  );

  const features = useOptionalAtomValue(meshCodeLayers[0]?.featuresAtom);

  const meshCodeProperties = useMemo(() => {
    if (!features) return [];
    return [
      {
        id: "meshCode",
        name: "メッシュコード",
        values: features.map(feature => feature.meshCode) ?? [],
      },
    ];
  }, [features]);

  const meshCodes = useMemo(() => {
    return features?.map(feature => feature.meshCode) ?? [];
  }, [features]);

  const { cityNames, loading, data } = useCityGMLFiles({
    meshIdsStrict: meshCodes,
  });

  const { packs, handlePacking, handleDownloadPack } = useCityGMLPacks({ data });

  const cityProperties = useMemo(() => {
    return [
      {
        id: "cityName",
        name: "関連市区町村",
        values: cityNames ?? [],
      },
    ];
  }, [cityNames]);

  if (meshCodeLayers.length === 0) {
    return null;
  }
  return (
    <ParameterList>
      <Divider />
      <PropertyParameterItem properties={meshCodeProperties} featureType="tags" version={DEFAULT_PLATEAU_SPEC_VERSION}/>
      {loading ? (
        <LoadingWrapper>
          <LoadingAnimationIcon size={16} />
        </LoadingWrapper>
      ) : (
        <>
          {cityProperties[0].values.length > 0 && (
            <>
              <Divider />
              <PropertyParameterItem properties={cityProperties} featureType="tags" />
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
  );
};

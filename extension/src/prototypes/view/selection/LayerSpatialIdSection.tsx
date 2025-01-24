import { Divider } from "@mui/material";
import { atom, useAtomValue } from "jotai";
import { FC, useMemo } from "react";
// import ReactJson from "react-json-view";

// import useCityGMLAttributes from "../../../shared/api/citygml/hooks/useCityGMLAttributes";
import { LayerModel } from "../../layers";
import { ParameterList, PropertyParameterItem } from "../../ui-components";
import { SPATIAL_ID_LAYER } from "../../view-layers";

// const JSONWrapper = styled("div")(({ theme }) => ({
//   padding: theme.spacing(1.25, 2),
// }));
export interface LayerSpatialIdSectionProps {
  layers: readonly LayerModel[];
}

export const LayerSpatialIdSection: FC<LayerSpatialIdSectionProps> = ({ layers }) => {
  const spatialIdLayers = useMemo(
    () =>
      layers.filter(
        (layer): layer is LayerModel<typeof SPATIAL_ID_LAYER> => layer.type === SPATIAL_ID_LAYER,
      ),
    [layers],
  );

  const features = useAtomValue(
    useMemo(
      () => atom(get => spatialIdLayers.flatMap(layer => get(layer.featuresAtom))),
      [spatialIdLayers],
    ),
  );

  const spaceIdProperties = useMemo(() => {
    if (!features || features.length === 0) return [];
    return [
      {
        id: "spaceId",
        name: "空間ID",
        values: features.map(feature => feature.data.id),
      },
    ];
  }, [features]);

  const spaceIdZFXYProperties = useMemo(() => {
    if (!features || features.length === 0) return [];
    return [
      {
        id: "spaceIdZoomZFXY",
        name: "ZFXY",
        values: features.map(feature => feature.data.zfxyStr),
      },
    ];
  }, [features]);

  // const spaceZFXYStrs = useMemo(() => {
  //   if (!features || features.length === 0) return [];
  //   return features.map(feature => feature.data.zfxyStr);
  // }, [features]);

  // const { loading, attributes } = useCityGMLAttributes({ spaceZFXYStrs });

  if (spatialIdLayers.length === 0) {
    return null;
  }
  return (
    <ParameterList>
      <Divider />
      <PropertyParameterItem properties={spaceIdProperties} featureType="tags" />
      <Divider />
      <PropertyParameterItem properties={spaceIdZFXYProperties} featureType="tags" />
      {/* {!loading && attributes.length > 0 && (
        <>
          <Divider />
          <JSONWrapper>
            <ReactJson
              src={attributes}
              displayDataTypes={false}
              enableClipboard={false}
              displayObjectSize={false}
              quotesOnKeys={false}
              indentWidth={2}
              collapsed={true}
              style={{ wordBreak: "break-all", lineHeight: 1.2 }}
            />
          </JSONWrapper>
        </>
      )} */}
    </ParameterList>
  );
};

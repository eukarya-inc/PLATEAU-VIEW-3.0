import { useAtomValue } from "jotai";
import { FC, useMemo } from "react";

import { LayerModel } from "../../layers";
import { ParameterList, PropertyParameterItem } from "../../ui-components";
import { MESH_CODE_LAYER } from "../../view-layers";

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

  const features = useAtomValue(meshCodeLayers[0].featuresAtom);

  const properties = useMemo(() => {
    if (!features) return [];
    const meshCodesStr = features.map(feature => feature.meshCode).join(" ");
    return [
      {
        id: "meshCode",
        name: "メッシュコード",
        values: [meshCodesStr],
      },
    ];
  }, [features]);

  if (meshCodeLayers.length === 0) {
    return null;
  }
  return (
    <ParameterList>
      <PropertyParameterItem properties={properties} featureType="meshCode" />
    </ParameterList>
  );
};

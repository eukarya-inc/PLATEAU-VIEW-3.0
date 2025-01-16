import { saveAs } from "file-saver";
import { atom, useAtomValue } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { LayerModel } from "../../layers";
import { ButtonParameterItem, ParameterList } from "../../ui-components";
import { SPATIAL_ID_LAYER } from "../../view-layers";

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

  const handleExport = useCallback(() => {
    saveAs(
      new Blob([JSON.stringify(features)], {
        type: "text/plain",
      }),
      "spatialIdSpaces.json",
    );
  }, [features]);

  if (spatialIdLayers.length === 0) {
    return null;
  }
  return (
    <ParameterList>
      <ButtonParameterItem disabled={features.length === 0} onClick={handleExport}>
        {spatialIdLayers.length > 1 ? `${spatialIdLayers.length}個の` : ""}
        空間をエキスポート
      </ButtonParameterItem>
    </ParameterList>
  );
};

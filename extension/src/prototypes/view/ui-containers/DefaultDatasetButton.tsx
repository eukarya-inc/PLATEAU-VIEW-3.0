import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useMemo, type FC } from "react";

import { DatasetFragmentFragment, DatasetItem } from "../../../shared/graphql/types/catalog";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { createRootLayerAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer, useFindLayer } from "../../layers";
import { ContextButton } from "../../ui-components";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { datasetTypeNames } from "../constants/datasetTypeNames";
import { PlateauDatasetType } from "../constants/plateau";
import { showDataFormatsAtom } from "../states/app";

export interface DefaultDatasetButtonProps {
  dataset: DatasetFragmentFragment;
  municipalityCode: string;
  disabled?: boolean;
}

export const DefaultDatasetButton: FC<DefaultDatasetButtonProps> = memo(
  ({ dataset, municipalityCode, disabled = false }) => {
    const layers = useAtomValue(rootLayersLayersAtom);
    const layerType = datasetTypeLayers[dataset.type.code as PlateauDatasetType];
    const findLayer = useFindLayer();
    const layer = useMemo(
      () =>
        layerType != null
          ? findLayer(layers, {
              id: dataset.id,
            })
          : undefined,
      [dataset.id, layers, layerType, findLayer],
    );
    const settings = useAtomValue(settingsAtom);

    const addLayer = useAddLayer();
    const removeLayer = useSetAtom(removeLayerAtom);

    const handleClick = useCallback(() => {
      if (layerType == null) {
        return;
      }
      if (layer == null) {
        const filteredSettings = settings.filter(
          s => s.datasetId === dataset.id && dataset.items[0].id === s.dataId,
        );
        addLayer(
          createRootLayerAtom({
            type: layerType,
            datasetId: dataset.id,
            title: dataset.name,
            settings: filteredSettings,
            dataList: dataset.items as DatasetItem[],
            areaCode: municipalityCode,
          }),
        );
      } else {
        removeLayer(layer.id);
      }
    }, [dataset, layer, layerType, addLayer, removeLayer, municipalityCode, settings]);

    const datum = dataset.items[0];
    const showDataFormats = useAtomValue(showDataFormatsAtom);
    if (datum == null) {
      console.warn("Dataset must include at least 1 datum.");
      return null;
    }
    return (
      <ContextButton
        selected={layer != null}
        disabled={disabled || layerType == null}
        onClick={handleClick}>
        {datasetTypeNames[dataset.type.code as PlateauDatasetType]}
        {showDataFormats ? ` (${datum.format})` : null}
      </ContextButton>
    );
  },
);

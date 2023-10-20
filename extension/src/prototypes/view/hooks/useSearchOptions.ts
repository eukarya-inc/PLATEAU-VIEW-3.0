import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useDatasets } from "../../../shared/graphql";
import { Dataset, DatasetsQuery } from "../../../shared/graphql/types/catalog";
import { TileFeatureIndex } from "../../../shared/plateau/layers";
import { areasAtom } from "../../../shared/states/address";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { createRootLayerAtom } from "../../../shared/view-layers";
import { LayerModel, addLayerAtom, useFindLayer } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { isNotNullish } from "../../type-helpers";
import { type SearchOption } from "../../ui-components";
import { BUILDING_LAYER } from "../../view-layers";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";
// import { datasetTypeLayers } from "../constants/datasetTypeLayers";
// import { areasAtom } from "../states/address";

export interface DatasetSearchOption extends SearchOption {
  type: "dataset";
  dataset: DatasetsQuery["datasets"][number];
}

export interface BuildingSearchOption extends SearchOption /* , earchableFeatureRecord */ {
  type: "building";
  featureIndex: TileFeatureIndex;
  lat?: number;
  long?: number;
}

export interface AddressSearchOption extends SearchOption {
  type: "address";
}

export interface SearchOptionsParams {
  inputValue?: string;
  skip?: boolean;
}

// TODO(reearth): Search entire data
function useDatasetSearchOptions({
  inputValue,
  skip = false,
}: SearchOptionsParams = {}): readonly DatasetSearchOption[] {
  const areas = useAtomValue(areasAtom);
  const municipalityCodes = useMemo(
    () => areas?.filter(area => area.type === "municipality").map(area => area.code) ?? [],
    [areas],
  );
  const query = useDatasets(
    inputValue
      ? {
          searchTokens: inputValue.split(/ |\u3000/),
        }
      : municipalityCodes.length > 0
      ? {
          areaCodes: municipalityCodes,
        }
      : {},
    { skip: skip || (!inputValue && !municipalityCodes.length) },
  );

  const layers = useAtomValue(rootLayersLayersAtom);
  const findLayer = useFindLayer();

  return useMemo(() => {
    if (skip) {
      return [];
    }
    return (
      query.data?.datasets
        .filter(dataset => {
          const layerType = datasetTypeLayers[dataset.type.code as PlateauDatasetType];
          return (
            !layerType ||
            findLayer(layers, {
              id: dataset.id,
            }) == null
          );
        })
        .map(dataset => ({
          type: "dataset" as const,
          name: dataset.name,
          index: `${dataset.name}${dataset.prefecture?.name ?? ""}${dataset.city?.name ?? ""}${
            dataset.ward?.name ?? ""
          }`,
          dataset,
        })) ?? []
    );
  }, [skip, query, layers, findLayer]);
}

function useBuildingSearchOption({
  skip = false,
}: SearchOptionsParams = {}): readonly BuildingSearchOption[] {
  const layers = useAtomValue(rootLayersLayersAtom);
  const featureIndices = useAtomValue(
    useMemo(
      () =>
        atom(get =>
          layers
            .filter(
              (layer): layer is LayerModel<typeof BUILDING_LAYER> => layer.type === BUILDING_LAYER,
            )
            .map(layer => get(layer.featureIndexAtom))
            .filter(isNotNullish),
        ),
      [layers],
    ),
  );
  const [featureIndicesKey, setFeatureIndicesKey] = useState(0);
  useEffect(() => {
    setFeatureIndicesKey(value => value + 1);
  }, [featureIndices]);

  return useMemo(
    () => {
      if (skip) {
        return [];
      }
      return featureIndices.flatMap(featureIndex => {
        const fs =
          window.reearth?.layers?.findFeaturesByIds?.(
            featureIndex.layerId,
            featureIndex.featureIds,
          ) ?? [];
        const addedIds: string[] = [];
        return fs.reduce<BuildingSearchOption[]>((res, f) => {
          if (f?.properties?.["名称"] && !addedIds.includes(f.id)) {
            res.push({
              type: "building" as const,
              name: f?.properties?.["名称"],
              featureIndex,
              id: f?.id,
            });
            addedIds.push(f.id);
          }
          return res;
        }, []);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skip, featureIndices, featureIndicesKey],
  );
}

export interface SearchOptions {
  datasets: readonly DatasetSearchOption[];
  buildings: readonly BuildingSearchOption[];
  addresses: readonly AddressSearchOption[];
  select: (option: SearchOption) => void;
}

export function useSearchOptions(options?: SearchOptionsParams): SearchOptions {
  const datasets = useDatasetSearchOptions(options);
  const buildings = useBuildingSearchOption(options);

  const addLayer = useSetAtom(addLayerAtom);
  const setScreenSpaceSelection = useSetAtom(screenSpaceSelectionAtom);
  const select = useCallback(
    (option: SearchOption) => {
      switch (option.type) {
        case "dataset": {
          const datasetOption = option as DatasetSearchOption;
          const dataset = datasetOption.dataset as Dataset;
          const type = datasetTypeLayers[dataset.type.code as PlateauDatasetType];
          const municipalityCode = datasetOption.dataset.wardCode;
          if (type == null || !municipalityCode) {
            return;
          }
          if (type === BUILDING_LAYER) {
            addLayer(
              createRootLayerAtom({
                datasetId: dataset.id,
                type,
                title: dataset.name,
                // TODO: Support components
                settings: [],
                dataList: dataset.items,
                areaCode: municipalityCode,
                currentDataId: datasetOption.dataset.items[0].id,
              }),
            );
          } else {
            addLayer(
              createRootLayerAtom({
                datasetId: datasetOption.dataset.id,
                type,
                title: dataset.name,
                // TODO: Support components
                settings: [],
                dataList: dataset.items,
                areaCode: municipalityCode,
                currentDataId: datasetOption.dataset.items[0].id,
              }),
            );
          }
          break;
        }
        case "building": {
          const buildingOption = option as BuildingSearchOption;
          invariant(buildingOption.id);
          // TODO: Implement flyTo by `_x` and `_y` properties which are embeded in feature.
          setScreenSpaceSelection([
            {
              type: "TILESET_FEATURE",
              value: {
                layerId: buildingOption.featureIndex.layerId,
                featureIndex: buildingOption.featureIndex,
                key: buildingOption.id,
              },
            },
          ]);
          break;
        }
      }
    },
    [setScreenSpaceSelection, addLayer],
  );

  return {
    datasets,
    buildings,
    addresses: [],
    select,
  };
}

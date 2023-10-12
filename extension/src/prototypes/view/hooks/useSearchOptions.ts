import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { TileFeatureIndex } from "../../../shared/plateau/layers";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { LayerModel } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { isNotNullish } from "../../type-helpers";
import { type SearchOption } from "../../ui-components";
import { BUILDING_LAYER } from "../../view-layers";
// import { datasetTypeLayers } from "../constants/datasetTypeLayers";
// import { areasAtom } from "../states/address";

export interface DatasetSearchOption extends SearchOption {
  type: "dataset";
  // dataset: DatasetsQuery["datasets"][number];
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
  skip?: boolean;
}

// TODO(ReEarth): Support search options
// function useDatasetSearchOptions({
//   skip = false,
// }: SearchOptionsParams = {}): readonly DatasetSearchOption[] {
//   const areas = useAtomValue(areasAtom);
//   const municipalityCodes = useMemo(
//     () => areas?.filter(area => area.type === "municipality").map(area => area.code) ?? [],
//     [areas],
//   );
//   const query = useDatasetsQuery({
//     variables:
//       municipalityCodes.length > 0
//         ? {
//             municipalityCodes,
//             includeTypes: [
//               // TODO: Update supported dataset types.
//               PlateauDatasetType.Bridge,
//               PlateauDatasetType.Building,
//               PlateauDatasetType.LandUse,
//               PlateauDatasetType.LandSlideRisk,
//               PlateauDatasetType.RiverFloodingRisk,
//               PlateauDatasetType.Road,
//               PlateauDatasetType.UrbanPlanning,
//             ],
//           }
//         : undefined,
//     skip: skip || municipalityCodes.length === 0,
//   });

//   const layers = useAtomValue(layersAtom);
//   const findLayer = useFindLayer();

//   return useMemo(() => {
//     if (skip) {
//       return [];
//     }
//     return (
//       query.data?.datasets
//         .filter(dataset => {
//           if (dataset.municipality == null) {
//             return undefined;
//           }
//           const layerType = datasetTypeLayers[dataset.type];
//           return (
//             layerType == null ||
//             findLayer(layers, {
//               type: layerType,
//               municipalityCode: dataset.municipality.code,
//               datasetId: dataset.id,
//             }) == null
//           );
//         })
//         .map(dataset => ({
//           type: "dataset" as const,
//           name: dataset.name !== "" ? dataset.name : dataset.typeName,
//           dataset,
//         })) ?? []
//     );
//   }, [skip, query, layers, findLayer]);
// }

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
  // datasets: readonly DatasetSearchOption[];
  buildings: readonly BuildingSearchOption[];
  addresses: readonly AddressSearchOption[];
  select: (option: SearchOption) => void;
}

export function useSearchOptions(options?: SearchOptionsParams): SearchOptions {
  // const datasets = useDatasetSearchOptions(options);
  const buildings = useBuildingSearchOption(options);

  // const addLayer = useSetAtom(addLayerAtom);
  const setScreenSpaceSelection = useSetAtom(screenSpaceSelectionAtom);
  const select = useCallback(
    (option: SearchOption) => {
      switch (option.type) {
        case "dataset": {
          // const datasetOption = option as DatasetSearchOption;
          // const type = datasetTypeLayers[datasetOption.dataset.type];
          // const municipality = datasetOption.dataset.municipality;
          // if (type == null || municipality == null) {
          //   return;
          // }
          // if (type === BUILDING_LAYER) {
          //   addLayer(
          //     createViewLayer({
          //       type,
          //       municipalityCode: municipality.code,
          //     }),
          //   );
          // } else {
          //   addLayer(
          //     createViewLayer({
          //       type,
          //       municipalityCode: municipality.code,
          //       datasetId: datasetOption.dataset.id,
          //       datumId: datasetOption.dataset.data[0].id,
          //     }),
          //   );
          // }
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
    [setScreenSpaceSelection],
  );

  return {
    // datasets,
    buildings,
    addresses: [],
    select,
  };
}

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, type FC, useMemo, useRef, useState } from "react";
import format from "string-template";

import { LayerType, useAddLayer } from "../../../prototypes/layers";
import { isNotNullish } from "../../../prototypes/type-helpers";
import {
  censusDatasetMeshCodes,
  censusDatasets,
} from "../../../prototypes/view/constants/censusDatasets";
import { readyAtom } from "../../../prototypes/view/states/app";
import { HEATMAP_LAYER, MY_DATA_LAYER, PEDESTRIAN_LAYER } from "../../../prototypes/view-layers";
import { useDatasetsByIds } from "../../graphql";
import { DatasetItem } from "../../graphql/types/catalog";
import { getShareId } from "../../sharedAtoms";
import { settingsAtom } from "../../states/setting";
import { SharedRootLayer, getSharedRootLayersAtom } from "../../states/share";
import { templatesAtom } from "../../states/template";
import {
  RootLayerForLayerAtomParams,
  createRootLayerForDatasetAtom,
  createRootLayerForLayerAtom,
} from "../../view-layers/rootLayer";

const DEFAULT_BUILDING_IDS = ["d_13101_bldg", "d_13102_bldg"];

const DEFAULT_LAYER_PARAMS: RootLayerForLayerAtomParams<LayerType>[] = [
  {
    type: PEDESTRIAN_LAYER,
    location: {
      longitude: 139.769,
      latitude: 35.68,
    },
  },
];

export const InitialLayers: FC = () => {
  const addLayer = useAddLayer();

  // TODO: Get share ID
  const shareId = getShareId();
  const getSharedRootLayers = useSetAtom(getSharedRootLayersAtom);
  const [sharedRootLayers, setSharedRootLayers] = useState<SharedRootLayer[] | undefined>();
  const [isSharedDataLoaded, setIsSharedDataLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      const layers = await getSharedRootLayers();
      setSharedRootLayers(layers);
      setIsSharedDataLoaded(true);
    };
    if (shareId) {
      run();
    } else {
      setIsSharedDataLoaded(true);
    }
  }, [getSharedRootLayers, shareId]);

  const datasetIds = useMemo(
    () =>
      shareId && isSharedDataLoaded
        ? sharedRootLayers
            ?.filter(
              (l): l is Extract<SharedRootLayer, { type: "dataset" }> => l.type === "dataset",
            )
            .map(({ datasetId }) => datasetId) ?? []
        : DEFAULT_BUILDING_IDS,
    [shareId, sharedRootLayers, isSharedDataLoaded],
  );

  const query = useDatasetsByIds(datasetIds, {
    skip: !!shareId && !isSharedDataLoaded && !sharedRootLayers?.length,
  });
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const initialDatasets = useMemo(() => query.data?.nodes ?? [], [query]);

  const initialLayers = useMemo(() => {
    if (!sharedRootLayers?.length) return DEFAULT_LAYER_PARAMS;
    return sharedRootLayers
      .map(l => {
        switch (l.type) {
          case "heatmap": {
            const dataset = censusDatasets.find(d => d.id === l.datasetId);
            const data = dataset?.data.find(d => d.id === l.dataId);
            if (!dataset || !data) return;
            return {
              type: HEATMAP_LAYER,
              datasetId: l.datasetId,
              dataId: l.dataId,
              title: data.name,
              getUrl: (code: string) => format(dataset.urlTemplate, { code }),
              codes: censusDatasetMeshCodes,
              parserOptions: {
                codeColumn: 0,
                valueColumn: data.column,
                skipHeader: 2,
              },
            };
          }
          case "pedestrian":
            return {
              id: l.id,
              type: PEDESTRIAN_LAYER,
            };
          case "myData":
            return {
              title: l.title ?? "",
              format: l?.format,
              type: MY_DATA_LAYER,
              url: l?.url,
              id: l?.id,
              csv: l?.csv,
              layers: l?.layers,
            };
        }
      })
      .filter(isNotNullish);
  }, [sharedRootLayers]);

  const setReady = useSetAtom(readyAtom);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const templatesRef = useRef(templates);
  templatesRef.current = templates;
  useEffect(() => {
    if (query.loading || !isSharedDataLoaded) return;

    const remove = [
      ...initialDatasets.map(d => {
        const dataList = d.items as DatasetItem[];
        return addLayer(
          createRootLayerForDatasetAtom({
            dataset: d,
            areaCode: d.wardCode || d.cityCode || d.prefectureCode,
            currentDataId: dataList.find(v => v.name === "LOD2（テクスチャなし）")?.id,
            settings: settingsRef.current.filter(s => s.datasetId === d.id),
            templates: templatesRef.current,
          }),
          { autoSelect: false },
        );
      }),
      ...(initialLayers?.map(l =>
        addLayer(createRootLayerForLayerAtom(l as RootLayerForLayerAtomParams<LayerType>), {
          autoSelect: false,
        }),
      ) ?? []),
    ];
    setReady(true);
    return () => {
      remove.forEach(remove => {
        remove();
      });
    };
  }, [
    addLayer,
    initialDatasets,
    shareId,
    query.loading,
    setReady,
    initialLayers,
    isSharedDataLoaded,
  ]);

  return null;
};

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
import {
  HEATMAP_LAYER,
  MY_DATA_LAYER,
  PEDESTRIAN_LAYER,
  SKETCH_LAYER,
  STORY_LAYER,
} from "../../../prototypes/view-layers";
import { INITIAL_PEDESTRIAN_COORDINATES } from "../../constants";
import { useDatasetsByIds } from "../../graphql";
import { getShareId, getSharedStoreValue } from "../../sharedAtoms";
import { settingsAtom } from "../../states/setting";
import {
  SHARED_PROJECT_ID_KEY,
  SharedRootLayer,
  getSharedRootLayersAtom,
} from "../../states/share";
import { templatesAtom } from "../../states/template";
import {
  RootLayerForLayerAtomParams,
  createRootLayerForDatasetAtom,
  createRootLayerForLayerAtom,
} from "../../view-layers/rootLayer";
import { isAppReadyAtom } from "../state/app";

export const InitialLayers: FC = () => {
  const addLayer = useAddLayer();

  // TODO: Get share ID
  const shareId = getShareId();
  const getSharedRootLayers = useSetAtom(getSharedRootLayersAtom);
  const [sharedRootLayers, setSharedRootLayers] = useState<SharedRootLayer[] | undefined>();
  const [isSharedDataLoaded, setIsSharedDataLoaded] = useState(false);
  const isAppReady = useAtomValue(isAppReadyAtom);
  const isInitialized = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (!isAppReady) return;
      const layers = await getSharedRootLayers();
      setSharedRootLayers(layers);
      setIsSharedDataLoaded(true);
    };
    if (shareId) {
      run();
    } else {
      setIsSharedDataLoaded(true);
    }
  }, [getSharedRootLayers, shareId, isAppReady]);

  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const defaultLayerParams: RootLayerForLayerAtomParams<LayerType>[] = useMemo(
    () => [
      {
        type: PEDESTRIAN_LAYER,
        location: {
          longitude: INITIAL_PEDESTRIAN_COORDINATES?.lng ?? 139.769,
          latitude: INITIAL_PEDESTRIAN_COORDINATES?.lat ?? 35.68,
        },
      },
    ],
    [],
  );

  const defaultBuildings = useMemo(
    () =>
      settings
        .filter(s => !!s.general?.initialLayer?.isInitialLayer)
        .map(s => ({
          datasetId: s.datasetId,
          dataId: s.dataId,
        })),
    [settings],
  );

  const datasetIds = useMemo(
    () =>
      shareId && isSharedDataLoaded
        ? sharedRootLayers
            ?.filter(
              (l): l is Extract<SharedRootLayer, { type: "dataset" }> => l.type === "dataset",
            )
            .map(({ datasetId }) => datasetId) ?? []
        : defaultBuildings.map(b => b.datasetId),
    [shareId, sharedRootLayers, isSharedDataLoaded, defaultBuildings],
  );

  const query = useDatasetsByIds(datasetIds, {
    skip: !!shareId && !isSharedDataLoaded && !sharedRootLayers?.length,
  });

  const initialDatasets = useMemo(() => query.data?.nodes ?? [], [query]);

  const initialLayers = useMemo(() => {
    if (!sharedRootLayers?.length) return defaultLayerParams;
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
          case "sketch":
            return {
              id: l.id,
              title: l.title,
              type: SKETCH_LAYER,
              features: l.features,
            };
          case "story":
            return {
              id: l.id,
              title: l.title,
              type: STORY_LAYER,
              captures: l.captures,
            };
        }
      })
      .filter(isNotNullish);
  }, [sharedRootLayers, defaultLayerParams]);

  const setReady = useSetAtom(readyAtom);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const templatesRef = useRef(templates);
  templatesRef.current = templates;
  useEffect(() => {
    if (query.loading || !isSharedDataLoaded || !isAppReady || isInitialized.current) return;

    const initialize = async () => {
      const sharedProjectIdUnknown =
        (await getSharedStoreValue(SHARED_PROJECT_ID_KEY)) ?? undefined;
      const sharedProjectId =
        typeof sharedProjectIdUnknown === "string" ? sharedProjectIdUnknown : undefined;

      const sharedDatasetLayers = sharedRootLayers?.filter(
        (l): l is Extract<SharedRootLayer, { type: "dataset" }> => l.type === "dataset",
      );

      initialDatasets.forEach(d => {
        const { dataId, groupId } = sharedDatasetLayers?.find(r => r.datasetId === d.id) ?? {};
        addLayer(
          createRootLayerForDatasetAtom({
            dataset: d,
            areaCode: d.wardCode || d.cityCode || d.prefectureCode,
            settings: settingsRef.current.filter(s => s.datasetId === d.id),
            templates: templatesRef.current,
            shareId: sharedProjectId,
            currentDataId: sharedProjectId
              ? dataId
              : defaultBuildings.find(b => b.datasetId === d.id)?.dataId,
            currentGroupId: groupId,
          }),
          { autoSelect: false },
        );
      });
      initialLayers?.forEach(l =>
        addLayer(
          createRootLayerForLayerAtom({
            ...l,
            shareId: sharedProjectId,
          } as RootLayerForLayerAtomParams<LayerType>),
          {
            autoSelect: false,
          },
        ),
      );

      setReady(true);
    };
    initialize();
    isInitialized.current = true;
  }, [
    addLayer,
    initialDatasets,
    shareId,
    query.loading,
    setReady,
    defaultBuildings,
    initialLayers,
    isSharedDataLoaded,
    isAppReady,
    sharedRootLayers,
  ]);

  return null;
};

import { useEffect, type FC, useMemo } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { mockDatasets, mockSettings } from "../../api/mock";
import { createRootLayerAtom } from "../../view-layers/rootLayer";

const INITIAL_DATASET_ID_LIST = [
  {
    datasetId: "13101",
    dataId: "2",
  },
  {
    datasetId: "13102",
    dataId: "2",
  },
  // For debug
  // {
  //   datasetId: "13101_shelter",
  //   dataId: "1",
  // },
];

export const InitialLayers: FC = () => {
  const addLayer = useAddLayer();

  const datasets = mockDatasets;
  const settings = mockSettings;

  const initialDatasets = useMemo(
    () => datasets.filter(d => INITIAL_DATASET_ID_LIST.find(d2 => d.id === d2.datasetId)),
    [datasets],
  );

  // TODO: Get share ID
  const shareId = undefined;

  useEffect(() => {
    const remove = initialDatasets.map(d => {
      const dataIds = d.data.map(data => data.id);
      return addLayer(
        createRootLayerAtom({
          datasetId: d.id,
          dataList: d.data,
          title: d.municipalityName,
          currentDataId: INITIAL_DATASET_ID_LIST.find(
            d1 => d1.datasetId === d.id && dataIds.includes(d1.dataId),
          )?.dataId,
          settings: settings.filter(s => s.datasetId === d.id && dataIds.includes(s.dataId)),
          shareId,
        }),
        { autoSelect: false },
      );
    });
    // const remove = [
    // addLayer(
    //   createRootLayerAtom({
    //     type: BUILDING_LAYER,
    //     municipalityCode: "13101",
    //     version: "2020",
    //     lod: 2,
    //     textured: false,
    //   }),
    //   { autoSelect: false },
    // ),
    //   addLayer(
    //     createViewLayer({
    //       type: BUILDING_LAYER,
    //       municipalityCode: "13102",
    //       version: "2020",
    //       lod: 2,
    //       textured: false,
    //     }),
    //     { autoSelect: false },
    //   ),
    //   // addLayer(
    //   //   createViewLayer({
    //   //     type: PEDESTRIAN_LAYER,
    //   //     location: {
    //   //       longitude: 139.769,
    //   //       latitude: 35.68,
    //   //     },
    //   //   }),
    //   //   { autoSelect: false },
    //   // ),
    //   // addLayer(
    //   //   createViewLayer({
    //   //     type: HEATMAP_LAYER,
    //   //     urls: [
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5339.txt`,
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5439.txt`,
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5340.txt`,
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5440.txt`,
    //   //     ],
    //   //     parserOptions: {
    //   //       codeColumn: 0,
    //   //       valueColumn: 4,
    //   //       skipHeader: 2,
    //   //     },
    //   //   }),
    //   //   { autoSelect: false },
    //   // ),
    // ];
    return () => {
      remove.forEach(remove => {
        remove();
      });
    };
  }, [addLayer, initialDatasets, settings, shareId]);

  return null;
};

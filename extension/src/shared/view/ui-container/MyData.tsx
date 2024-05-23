import { Feature, FeatureCollection, MultiPolygon, Polygon } from "@turf/turf";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { useCallback } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import { MY_DATA_LAYER, SKETCH_LAYER } from "../../../prototypes/view-layers";
import MyDataModal from "../../ui-components/MyData";
import { UserDataItem } from "../../ui-components/MyData/types";
import { decodeDataURL } from "../../ui-components/MyData/utils";
import { createRootLayerForLayerAtom } from "../../view-layers";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);
  const addLayer = useAddLayer();

  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

  const handleDataSetSubmit = (selectedItem: UserDataItem) => {
    if (selectedItem?.format === "plateau-sketch-geojson") {
      try {
        const data = decodeDataURL(selectedItem?.url ?? "");
        const featureCollection = JSON.parse(data) as FeatureCollection;
        const features = featureCollection.features.filter(
          (feature): feature is Feature<Polygon | MultiPolygon> =>
            feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon",
        );
        addLayer(
          createRootLayerForLayerAtom({
            id: selectedItem?.dataID,
            type: SKETCH_LAYER,
            features: features.map(feature => ({
              ...feature,
              properties: {
                ...(feature.properties ?? {}),
                id: nanoid(),
              },
            })),
          }),
          { autoSelect: false },
        );
      } catch (error) {
        console.error("failed to parse sketch layer data: ", error);
      }
    } else {
      addLayer(
        createRootLayerForLayerAtom({
          title: selectedItem.name ?? "",
          format: selectedItem?.format,
          type: MY_DATA_LAYER,
          url: selectedItem?.url,
          id: selectedItem?.dataID,
          csv: selectedItem?.additionalData?.data?.csv,
          layers: selectedItem?.layers,
        }),
        { autoSelect: false },
      );
    }

    onClose?.();
  };

  return <MyDataModal onSubmit={handleDataSetSubmit} show={showMyDataModal} onClose={onClose} />;
};

export default MyData;

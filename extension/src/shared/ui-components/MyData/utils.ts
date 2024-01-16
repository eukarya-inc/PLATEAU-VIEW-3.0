import { AddLayerOptions } from "../../../prototypes/layers/states";
import { MY_DATA_LAYER } from "../../../prototypes/view-layers";
import { createRootLayerForLayerAtom, RootLayerConfig } from "../../view-layers/rootLayer";

import { UserDataItem } from "./types";

export const handleDataSetSubmit = (
  selectedItem: UserDataItem,
  onAddLayer: (
    layer: Omit<RootLayerConfig, "id">,
    options?: AddLayerOptions | undefined,
  ) => () => void,
  onClose?: () => void,
) => {
  onAddLayer(
    createRootLayerForLayerAtom({
      title: selectedItem.name ?? "",
      format: selectedItem?.format,
      type: MY_DATA_LAYER,
      url: selectedItem?.url,
      id: selectedItem?.dataID,
    }),
    { autoSelect: false },
  );
  onClose?.();
};

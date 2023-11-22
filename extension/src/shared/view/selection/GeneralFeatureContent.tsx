import { Divider, List } from "@mui/material";
import { useSetAtom } from "jotai";
import { useCallback, type FC, useMemo } from "react";

import { screenSpaceSelectionAtom } from "../../../prototypes/screen-space-selection";
import { InspectorHeader } from "../../../prototypes/ui-components";
import {
  type SCREEN_SPACE_SELECTION,
  type SelectionGroup,
} from "../../../prototypes/view/states/selection";
import { layerTypeIcons, layerTypeNames } from "../../../prototypes/view-layers";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { findRootLayerAtom } from "../../states/rootLayer";

import { GeneralFeaturePropertiesSection } from "./GeneralFeaturePropertiesSection";

export interface GeneralFeatureContentProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof GENERAL_FEATURE;
  })["values"];
}

export const GeneralFeatureContent: FC<GeneralFeatureContentProps> = ({ values }) => {
  const findRootLayer = useSetAtom(findRootLayerAtom);
  const setSelection = useSetAtom(screenSpaceSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);
  const type = values[0].layerType;
  const rootLayer = useMemo(() => {
    const datasetId = values[0].datasetId;
    return findRootLayer(datasetId);
  }, [findRootLayer, values]);
  const title = useMemo(() => {
    if (rootLayer?.featureInspector?.basic?.titleType === "custom") {
      return rootLayer?.featureInspector?.basic?.customTitle ?? layerTypeNames[type];
    }
    return layerTypeNames[type];
  }, [rootLayer, type]);

  // TODO(reearth): Support hiding feature
  // const [hidden, setHidden] = useState(false);
  // const hideFeatures = useSetAtom(hideFeaturesAtom);
  // const showFeatures = useSetAtom(showFeaturesAtom);
  // const handleHide = useCallback(() => {
  //   hideFeatures(values.map(value => value.key));
  //   setHidden(true);
  // }, [values, hideFeatures]);
  // const handleShow = useCallback(() => {
  //   showFeatures(values.map(value => value.key));
  //   setHidden(false);
  // }, [values, showFeatures]);

  // TODO(reearth): Support highlight layer if necessary
  // const tilesetLayers = useAtomValue(highlightedTilesetLayersAtom);
  // const tilsetLayerIdsAtom = useMemo(
  //   () => atom(get => tilesetLayers.map(l => get(get(l.rootLayerAtom).layer).id)),
  //   [tilesetLayers],
  // );
  // const tilsetLayerIds = useAtomValue(tilsetLayerIdsAtom);
  // const setLayerSelection = useSetAtom(layerSelectionAtom);
  // const handleSelectLayers = useCallback(() => {
  //   setLayerSelection(tilsetLayerIds);
  // }, [tilsetLayerIds, setLayerSelection]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={title}
        iconComponent={layerTypeIcons[type]}
        // TODO(reearth): Support highlight layer if necessary
        // actions={
        //   <>
        //     <Tooltip title="レイヤーを選択">
        //       <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
        //         <LayerIcon />
        //       </IconButton>
        //     </Tooltip>
        //     <Tooltip title={hidden ? "表示" : "隠す"}>
        //       <IconButton
        //         aria-label={hidden ? "表示" : "隠す"}
        //         onClick={hidden ? handleShow : handleHide}>
        //         {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
        //       </IconButton>
        //     </Tooltip>
        //   </>
        // }
        onClose={handleClose}
      />
      <Divider />
      <GeneralFeaturePropertiesSection values={values} />
    </List>
  );
};

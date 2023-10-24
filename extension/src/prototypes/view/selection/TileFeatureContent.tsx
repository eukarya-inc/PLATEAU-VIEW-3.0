import { Divider, IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState, type FC, useMemo } from "react";

import { TILESET_FEATURE } from "../../../shared/reearth/layers";
import { layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import {
  BuildingIcon,
  InspectorHeader,
  LayerIcon,
  VisibilityOffIcon,
  VisibilityOnIcon,
} from "../../ui-components";
import {
  hideFeaturesAtom,
  highlightedTilesetLayersAtom,
  showFeaturesAtom,
} from "../../view-layers";
import { type SCREEN_SPACE_SELECTION, type SelectionGroup } from "../states/selection";

import { TileFeaturePropertiesSection } from "./TileFeaturePropertiesSection";

export interface TileFeatureContentProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof TILESET_FEATURE;
  })["values"];
}

export const TileFeatureContent: FC<TileFeatureContentProps> = ({ values }) => {
  const setSelection = useSetAtom(screenSpaceSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const [hidden, setHidden] = useState(false);
  const hideFeatures = useSetAtom(hideFeaturesAtom);
  const showFeatures = useSetAtom(showFeaturesAtom);
  const handleHide = useCallback(() => {
    hideFeatures(values.map(value => value.key));
    setHidden(true);
  }, [values, hideFeatures]);
  const handleShow = useCallback(() => {
    showFeatures(values.map(value => value.key));
    setHidden(false);
  }, [values, showFeatures]);

  const tilesetLayers = useAtomValue(highlightedTilesetLayersAtom);
  const tilsetLayerIdsAtom = useMemo(
    () => atom(get => tilesetLayers.map(l => get(get(l.rootLayerAtom).layer).id)),
    [tilesetLayers],
  );
  const tilsetLayerIds = useAtomValue(tilsetLayerIdsAtom);
  const setLayerSelection = useSetAtom(layerSelectionAtom);
  const handleSelectLayers = useCallback(() => {
    setLayerSelection(tilsetLayerIds);
  }, [tilsetLayerIds, setLayerSelection]);

  return (
    <List disablePadding>
      <InspectorHeader
        // TODO: Change name and icon according to the feature type.
        title={`${values.length}個の建築物`}
        iconComponent={BuildingIcon}
        actions={
          <>
            <Tooltip title="レイヤーを選択">
              <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
                <LayerIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={hidden ? "表示" : "隠す"}>
              <IconButton
                aria-label={hidden ? "表示" : "隠す"}
                onClick={hidden ? handleShow : handleHide}>
                {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
              </IconButton>
            </Tooltip>
          </>
        }
        onClose={handleClose}
      />
      <Divider />
      <TileFeaturePropertiesSection values={values} />
    </List>
  );
};
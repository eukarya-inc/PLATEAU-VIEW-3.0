import { List } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";
import invariant from "tiny-invariant";

// import { findRootLayerAtom } from "../../../shared/states/rootLayer";
import { LayerModel, layerSelectionAtom } from "../../layers";
import { InspectorHeader } from "../../ui-components";
import { STORY_LAYER, layerTypeIcons } from "../../view-layers";
import { LAYER_SELECTION, SelectionGroup } from "../states/selection";
import { toolAtom } from "../states/tool";

import { StoryEditSection } from "./StoryEditSection";
import { StoryInspectSection } from "./StoryInspectSection";

export interface StoryLayerContentProps {
  values: (SelectionGroup & {
    type: typeof LAYER_SELECTION;
    subtype: typeof STORY_LAYER;
  })["values"];
}

export const StoryLayerContent: FC<StoryLayerContentProps> = ({ values }) => {
  invariant(values.length === 1);

  const layer = values[0] as LayerModel<typeof STORY_LAYER>;
  // const findRootLayer = useSetAtom(findRootLayerAtom);
  // const rootLayer = findRootLayer(layer.id);
  // // const layerName = rootLayer?.layerName;
  // console.log(rootLayer);

  const tool = useAtomValue(toolAtom);
  const editMode = useMemo(() => tool?.type === "story", [tool]);

  const setSelection = useSetAtom(layerSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={editMode ? "Story Editor" : "Story Inspector"}
        iconComponent={layerTypeIcons.STORY_LAYER}
        onClose={handleClose}
      />
      {editMode ? <StoryEditSection layer={layer} /> : <StoryInspectSection />}
    </List>
  );
};

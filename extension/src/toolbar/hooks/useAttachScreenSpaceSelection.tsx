import { useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { screenSpaceSelectionAtom } from "../../prototypes/screen-space-selection";

export const useAttachScreenSpaceSelection = () => {
  const selections = useAtomValue(screenSpaceSelectionAtom);
  const layers = useMemo(
    () =>
      selections.reduce((res, s) => {
        let layerIndex = res.findIndex(v => v.layerId === s.value.layerId);
        if (layerIndex === -1) {
          layerIndex =
            res.push({
              layerId: s.value.layerId,
              featureId: [],
            }) - 1;
        }
        res[layerIndex].featureId.push(s.value.key);
        return res;
      }, [] as { layerId: string; featureId: string[] }[]),
    [selections],
  );
  useEffect(() => {
    window.reearth?.layers?.selectFeatures?.(layers);
  }, [layers]);
};

import { getRGBAFromString, RGBA, rgbaToString } from "@web/extensions/sidebar/utils/color";
import { getOverriddenLayerByDataID } from "@web/extensions/sidebar/utils/getOverriddenLayerByDataID";
import { useCallback, useEffect, useRef } from "react";

import { BaseFieldProps } from "../../types";

import { FLOOD_CONDITIONS } from "./conditions";

const FloodColor: React.FC<BaseFieldProps<"floodColor">> = ({ dataID, onUpdate, value }) => {
  const handleUpdate = useCallback(
    (property: any) => {
      onUpdate({
        ...value,
        updatedAt: new Date(),
        override: { "3dtiles": property },
      });
    },
    [onUpdate, value],
  );

  const onUpdateRef = useRef(handleUpdate);
  useEffect(() => {
    onUpdateRef.current = handleUpdate;
  }, [handleUpdate]);

  useEffect(() => {
    const updateTileset = async () => {
      const overriddenLayer = await getOverriddenLayerByDataID(dataID);

      // We can get transparency from RGBA. Because the color is defined as RGBA.
      const overriddenColor = overriddenLayer?.["3dtiles"]?.color;
      const transparency =
        getRGBAFromString(
          typeof overriddenColor === "string"
            ? overriddenColor
            : overriddenColor?.expression?.conditions?.[0]?.[1],
        )?.[3] || 1;

      const expression = {
        expression: {
          conditions: FLOOD_CONDITIONS.map(([k, v]: [string, string]) => {
            const rgba = getRGBAFromString(v);
            if (!rgba) {
              return [k, v];
            }
            const composedRGBA = [...rgba.slice(0, -1), transparency || rgba[3]] as RGBA;
            return [k, rgbaToString(composedRGBA)];
          }),
        },
      };

      onUpdateRef.current({ color: expression, colorBlendMode: "replace" });
    };
    updateTileset();
  }, [dataID]);

  return null;
};

export default FloodColor;

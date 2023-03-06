import { getRGBAFromString, RGBA, rgbaToString } from "@web/extensions/sidebar/utils/color";
import { getOverriddenLayerByDataID } from "@web/extensions/sidebar/utils/getOverriddenLayerByDataID";
import debounce from "lodash/debounce";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { BaseFieldProps } from "../../types";

export const useBuildingTransparency = ({
  options,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingTransparency">, "dataID"> & {
  options: Omit<BaseFieldProps<"buildingTransparency">["value"], "id" | "group" | "type">;
  onUpdate: (property: any) => void;
}) => {
  const renderRef = useRef<() => void>();
  const debouncedRender = useMemo(
    () => debounce(() => renderRef.current?.(), 100, { maxWait: 300 }),
    [],
  );

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const render = useCallback(() => {
    renderTileset(
      {
        dataID,
        transparency: options.transparency,
      },
      onUpdateRef,
    );
  }, [options.transparency, dataID]);

  useEffect(() => {
    renderRef.current = render;
    debouncedRender();
  }, [render, debouncedRender]);
};

export type State = {
  dataID: string | undefined;
  transparency: number;
};

const renderTileset = (state: State, onUpdateRef: RefObject<(property: any) => void>) => {
  const updateTileset = async () => {
    const overriddenLayer = await getOverriddenLayerByDataID(state.dataID);

    const transparency = (state.transparency ?? 100) / 100;

    // We can get transparency from RGBA. Because the color is defined as RGBA.
    const overriddenColor = overriddenLayer?.["3dtiles"]?.color;
    const defaultRGBA = rgbaToString([255, 255, 255, transparency]);
    const expression = (() => {
      if (!overriddenColor) {
        return defaultRGBA;
      }
      if (typeof overriddenColor === "string") {
        const rgba = getRGBAFromString(overriddenColor);
        return rgba ? rgbaToString([...rgba.slice(0, -1), transparency] as RGBA) : defaultRGBA;
      }
      return {
        expression: {
          conditions: overriddenColor.expression.conditions.map(([k, v]: [string, string]) => {
            const rgba = getRGBAFromString(v);
            if (!rgba) {
              return [k, defaultRGBA];
            }
            const composedRGBA = [...rgba.slice(0, -1), transparency] as RGBA;
            return [k, rgbaToString(composedRGBA)];
          }),
        },
      };
    })();

    onUpdateRef.current?.({
      color: expression,
    });
  };

  updateTileset();
};

import { getRGBAFromString, RGBA, rgbaToString } from "@web/extensions/sidebar/utils/color";
import { getOverriddenLayerByDataID } from "@web/extensions/sidebar/utils/getOverriddenLayerByDataID";
import debounce from "lodash/debounce";
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { BaseFieldProps } from "../../types";

export const useBuildingTransparency = ({
  options,
  dataID,
  onUpdate,
  onChangeTransparency,
}: Pick<BaseFieldProps<"buildingTransparency">, "dataID"> & {
  options: BaseFieldProps<"buildingTransparency">["value"]["userSettings"];
  onUpdate: (property: any) => void;
  onChangeTransparency: (transparency: number) => void;
}) => {
  const renderRef = useRef<() => void>();
  const debouncedRender = useMemo(
    () => debounce(() => renderRef.current?.(), 100, { maxWait: 300 }),
    [],
  );
  const isInitializedRef = useRef(false);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const render = useCallback(() => {
    renderTileset(
      {
        dataID,
        transparency: options.transparency,
        isInitializedRef,
      },
      onUpdateRef,
      onChangeTransparency,
    );
  }, [options.transparency, dataID, onChangeTransparency]);

  useEffect(() => {
    renderRef.current = render;
    debouncedRender();
  }, [render, debouncedRender]);
};

export type State = {
  dataID: string | undefined;
  transparency: number;
  isInitializedRef: MutableRefObject<boolean>;
};

const selectTransparency = (
  rgba: RGBA | undefined,
  transparency: number,
  shouldUseRGBA: boolean,
) => {
  if (shouldUseRGBA) {
    return rgba?.[3] ?? transparency;
  } else {
    return transparency;
  }
};

const renderTileset = (
  state: State,
  onUpdateRef: RefObject<(property: any) => void>,
  onChangeTransparency: (transparency: number) => void,
) => {
  const updateTileset = async () => {
    const overriddenLayer = await getOverriddenLayerByDataID(state.dataID);

    let transparency = (state.transparency ?? 100) / 100;

    // We can get transparency from RGBA. Because the color is defined as RGBA.
    const overriddenColor = overriddenLayer?.["3dtiles"]?.color;
    const defaultRGBA = rgbaToString([255, 255, 255, transparency]);
    const expression = (() => {
      if (!overriddenColor) {
        return defaultRGBA;
      }
      if (typeof overriddenColor === "string") {
        const rgba = getRGBAFromString(overriddenColor);
        transparency = selectTransparency(rgba, transparency, !state.isInitializedRef.current);
        return rgba ? rgbaToString([...rgba.slice(0, -1), transparency] as RGBA) : defaultRGBA;
      }

      const conditions = overriddenColor.expression.conditions.map(([k, v]: [string, string]) => {
        const rgba = getRGBAFromString(v);
        if (!rgba) {
          return [k, defaultRGBA];
        }
        transparency = selectTransparency(rgba, transparency, !state.isInitializedRef.current);
        const composedRGBA = [...rgba.slice(0, -1), transparency] as RGBA;
        return [k, rgbaToString(composedRGBA)];
      });

      return {
        expression: {
          conditions,
        },
      };
    })();

    if (!state.isInitializedRef.current) {
      onChangeTransparency(transparency * 100);
      state.isInitializedRef.current = true;
    }

    onUpdateRef.current?.({
      color: expression,
    });
  };

  updateTileset();
};

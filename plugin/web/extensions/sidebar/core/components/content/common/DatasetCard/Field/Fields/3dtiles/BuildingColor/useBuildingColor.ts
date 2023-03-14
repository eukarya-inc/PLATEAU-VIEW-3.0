import { getRGBAFromString, RGBA, rgbaToString } from "@web/extensions/sidebar/utils/color";
import { getOverriddenLayerByDataID } from "@web/extensions/sidebar/utils/getOverriddenLayerByDataID";
import debounce from "lodash/debounce";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { BaseFieldProps } from "../../types";

import { COLOR_TYPE_CONDITIONS, makeSelectedFloodCondition } from "./conditions";
import { INDEPENDENT_COLOR_TYPE } from "./constants";

export const useBuildingColor = ({
  options,
  initialized,
  floods,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingColor">, "dataID"> & {
  initialized: boolean;
  options: BaseFieldProps<"buildingColor">["value"]["userSettings"];
  floods: { id: string; label: string; featurePropertyName: string }[];
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

  const render = useCallback(async () => {
    renderTileset(
      {
        dataID,
        floods,
        colorType: options.colorType,
      },
      onUpdateRef,
    );
  }, [options.colorType, dataID, floods]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    renderRef.current = render;
    debouncedRender();
  }, [render, debouncedRender, initialized]);
};

export type State = {
  dataID: string | undefined;
  floods: { id: string; label: string; featurePropertyName: string }[];
  colorType: string;
};

const renderTileset = (state: State, onUpdateRef: RefObject<(property: any) => void>) => {
  const updateTileset = async () => {
    const overriddenLayer = await getOverriddenLayerByDataID(state.dataID);

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
        conditions: (
          COLOR_TYPE_CONDITIONS[
            (state.colorType as keyof typeof INDEPENDENT_COLOR_TYPE) || "none"
          ]?.map((cond): [string, string] => [cond.condition, cond.color]) ??
          makeSelectedFloodCondition(
            state.floods?.find(f => f.id === state.colorType)?.featurePropertyName,
          )
        ).map(([k, v]: [string, string]) => {
          const rgba = getRGBAFromString(v);
          if (!rgba) {
            return [k, v];
          }
          const composedRGBA = [...rgba.slice(0, -1), transparency || rgba[3]] as RGBA;
          return [k, rgbaToString(composedRGBA)];
        }),
      },
    };

    onUpdateRef.current?.({
      colorBlendMode: "replace",
      color: expression,
    });
  };

  updateTileset();
};

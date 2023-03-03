import { postMsg } from "@web/extensions/sidebar/utils";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { BaseFieldProps } from "../../types";

import { OptionsState } from "./constants";

export const useBuildingFilter = ({
  options,
  dataID,
}: Pick<BaseFieldProps<"buildingFilter">, "dataID"> & {
  options: OptionsState;
}) => {
  const renderer = useRef<Renderer>();
  const renderRef = useRef<() => void>();
  const debouncedRender = useMemo(
    () => debounce(() => renderRef.current?.(), 100, { maxWait: 300 }),
    [],
  );

  const render = useCallback(async () => {
    if (!renderer.current) {
      renderer.current = mountTileset({
        dataID,
        options,
      });
    }
    if (renderer.current) {
      renderer.current.update({
        dataID,
        options,
      });
    }
  }, [options, dataID]);

  useEffect(() => {
    renderRef.current = render;
    debouncedRender();
  }, [render, debouncedRender]);

  useEffect(
    () => () => {
      renderer.current?.unmount();
      renderer.current = undefined;
    },
    [],
  );
};

export type State = {
  dataID: string | undefined;
  options: OptionsState;
};

type Renderer = {
  update: (state: State) => void;
  unmount: () => void;
};

const mountTileset = (initialState: State): Renderer => {
  const state: Partial<State> = {};
  const updateState = (next: State) => {
    Object.entries(next).forEach(([k, v]) => {
      state[k as keyof State] = v as any;
    });
  };

  const updateTileset = () => {
    const defaultConditionalValue = (prop: string) =>
      `((\${${prop}} === "" || \${${prop}} === null || isNaN(Number(\${${prop}}))) ? 1 : Number(\${${prop}}))`;
    const condition = (
      max: number,
      range: [from: number, to: number] | undefined,
      conditionalValue: string,
    ) =>
      max === range?.[1]
        ? `${conditionalValue} >= ${range?.[0]}`
        : `${conditionalValue} >= ${range?.[0]} && ${conditionalValue} <= ${range?.[1]}`;
    const conditions = Object.entries(state.options || {}).reduce((res, [, v]) => {
      const conditionalValue = defaultConditionalValue(v.featurePropertyName);
      const conditionDef = condition(v.max, v.value, conditionalValue);
      return `${res ? `${res} && ` : ""}${conditionDef}`;
    }, "");
    postMsg({
      action: "update3dtilesShow",
      payload: {
        dataID: state.dataID,
        show: {
          expression: {
            conditions: [...(conditions ? [[conditions, "true"]] : []), ["true", "false"]],
          },
        },
      },
    });
  };

  // Initialize
  updateState(initialState);
  updateTileset();

  const update = (next: State) => {
    updateState(next);
    updateTileset();
  };
  const unmount = () => {
    postMsg({
      action: "reset3dtilesShow",
      payload: {
        dataID: state.dataID,
      },
    });
  };
  return { update, unmount };
};

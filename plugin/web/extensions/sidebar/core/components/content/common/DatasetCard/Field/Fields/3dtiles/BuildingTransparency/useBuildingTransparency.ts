import { postMsg } from "@web/extensions/sidebar/utils";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { BaseFieldProps } from "../../types";

export const useBuildingTransparency = ({
  value,
  dataID,
}: Pick<BaseFieldProps<"buildingTransparency">, "value" | "dataID">) => {
  const renderer = useRef<Renderer>();
  const renderRef = useRef<() => void>();
  const debouncedRender = useMemo(
    () => debounce(() => renderRef.current?.(), 50, { maxWait: 100 }),
    [],
  );

  const render = useCallback(async () => {
    if (!renderer.current) {
      renderer.current = mountTileset({
        dataID,
        transparency: value.transparency,
      });
    }
    if (renderer.current) {
      renderer.current.update({
        dataID,
        transparency: value.transparency,
      });
    }
  }, [value, dataID]);

  useEffect(() => {
    renderRef.current = render;
    debouncedRender();
  }, [render, debouncedRender]);

  useEffect(
    () => () => {
      renderer.current?.unmount();
      renderer.current = undefined;
    },
    [render, debouncedRender],
  );
};

export type State = {
  dataID: string | undefined;
  transparency: number;
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
    postMsg({
      action: "update3dtilesTransparency",
      payload: {
        dataID: state.dataID,
        transparency: (state.transparency ?? 100) / 100,
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
      action: "reset3dtilesTransparency",
      payload: {
        dataID: state.dataID,
      },
    });
  };
  return { update, unmount };
};

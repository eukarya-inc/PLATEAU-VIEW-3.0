import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useRef } from "react";

import { BaseFieldProps } from "../../types";

export const MAX_HEIGHT = 200;
export const MAX_ABOVEGROUND_FLOOR = 50;
export const MAX_BASEMENT_FLOOR = 5;

export const useBuildingShadow = ({
  options,
  dataID,
}: Pick<BaseFieldProps<"buildingShadow">, "dataID"> & {
  options: Omit<BaseFieldProps<"buildingShadow">["value"], "id" | "group" | "type">;
}) => {
  const renderer = useRef<Renderer>();

  const render = useCallback(async () => {
    if (!renderer.current) {
      renderer.current = mountTileset({
        dataID,
        shadow: options.shadow,
      });
    }
    if (renderer.current) {
      renderer.current.update({
        dataID,
        shadow: options.shadow,
      });
    }
  }, [options, dataID]);

  useEffect(() => {
    render();
  }, [render]);

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
  shadow: BaseFieldProps<"buildingShadow">["value"]["shadow"];
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
      action: "update3dtilesShadow",
      payload: {
        dataID: state.dataID,
        shadows: state.shadow,
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
      action: "reset3dtilesShadow",
      payload: {
        dataID: state.dataID,
      },
    });
  };
  return { update, unmount };
};

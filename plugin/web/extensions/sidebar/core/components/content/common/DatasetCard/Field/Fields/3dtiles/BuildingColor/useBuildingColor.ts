import { postMsg } from "@web/extensions/sidebar/utils";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { BaseFieldProps } from "../../types";

import { COLOR_TYPE_CONDITIONS, makeSelectedFloodCondition } from "./conditions";
import { INDEPENDENT_COLOR_TYPE } from "./constants";

export const useBuildingColor = ({
  options,
  initialized,
  floods,
  dataID,
}: Pick<BaseFieldProps<"buildingColor">, "dataID"> & {
  initialized: boolean;
  options: Omit<BaseFieldProps<"buildingColor">["value"], "id" | "group" | "type">;
  floods: { id: string; label: string; featurePropertyName: string }[];
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
        floods,
        colorType: options.colorType,
      });
    }
    if (renderer.current) {
      renderer.current.update({
        dataID,
        floods,
        colorType: options.colorType,
      });
    }
  }, [options.colorType, dataID, floods]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    renderRef.current = render;
    debouncedRender();
  }, [render, debouncedRender, initialized]);

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
  floods: { id: string; label: string; featurePropertyName: string }[];
  colorType: string;
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
      action: "update3dtilesColor",
      payload: {
        dataID: state.dataID,
        color: {
          expression: {
            conditions:
              COLOR_TYPE_CONDITIONS[
                (state.colorType as keyof typeof INDEPENDENT_COLOR_TYPE) || "none"
              ] ??
              makeSelectedFloodCondition(
                state.floods?.find(f => f.id === state.colorType)?.featurePropertyName,
              ),
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
      action: "reset3dtilesColor",
      payload: {
        dataID: state.dataID,
      },
    });
  };
  return { update, unmount };
};

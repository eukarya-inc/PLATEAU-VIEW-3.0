import { RefObject, useCallback, useEffect, useRef, MutableRefObject } from "react";

import { BaseFieldProps } from "../../types";

export const MAX_HEIGHT = 200;
export const MAX_ABOVEGROUND_FLOOR = 50;
export const MAX_BASEMENT_FLOOR = 5;

export const useBuildingShadow = ({
  options,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingShadow">, "dataID"> & {
  options: BaseFieldProps<"buildingShadow">["value"]["userSettings"];
  onUpdate: (property: any) => void;
}) => {
  const isInitializedRef = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const render = useCallback(async () => {
    renderTileset(
      {
        dataID,
        shadow: options.shadow,
        isInitializedRef,
      },
      onUpdateRef,
    );
  }, [options.shadow, dataID]);

  useEffect(() => {
    render();
  }, [render]);
};

export type State = {
  dataID: string | undefined;
  shadow: BaseFieldProps<"buildingShadow">["value"]["userSettings"]["shadow"];
  isInitializedRef: MutableRefObject<boolean>;
};

const renderTileset = (state: State, onUpdateRef: RefObject<(property: any) => void>) => {
  const updateTileset = () => {
    if (!state.isInitializedRef.current) {
      state.isInitializedRef.current = true;
    } else {
      onUpdateRef.current?.({
        shadows: state.shadow,
      });
    }
  };
  updateTileset();
};

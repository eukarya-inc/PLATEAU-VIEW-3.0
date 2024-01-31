import { Math as CesiumMath } from "@cesium/engine";
import { useAtomValue } from "jotai";
import { type FC, useEffect, useCallback, useRef } from "react";

import { autoRotateCameraAtom } from "../states/app";

export interface AutoRotateCameraProps {
  degreesPerMinute?: number;
}

const Content: FC<AutoRotateCameraProps> = ({ degreesPerMinute = 180 }) => {
  const radianPerMilliseconds = CesiumMath.toRadians(degreesPerMinute) / 60000;
  const camera = window.reearth?.camera;
  const dateRef = useRef<number>(Date.now());

  const handleTick = useCallback(() => {
    const now = Date.now();
    const elapsed = now - dateRef.current;
    camera?.rotateCameraOnCenter(radianPerMilliseconds * elapsed);
    dateRef.current = now;
  }, [camera, radianPerMilliseconds]);

  const handleRotateOnTickEventAdd = (callback: (date: Date) => void) => {
    window.reearth?.on?.("tick", callback);
  };

  const handleRotateOnTickEventRemove = (callback: (date: Date) => void) => {
    window.reearth?.off?.("tick", callback);
  };

  useEffect(() => {
    handleRotateOnTickEventAdd(handleTick);
    return () => {
      handleRotateOnTickEventRemove(handleTick);
    };
  }, [camera, handleTick, radianPerMilliseconds]);

  return null;
};

export const AutoRotateCamera: FC<AutoRotateCameraProps> = props => {
  const enabled = useAtomValue(autoRotateCameraAtom);
  return enabled && <Content {...props} />;
};

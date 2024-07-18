// import { Math as CesiumMath } from "@cesium/engine";
import { useAtomValue } from "jotai";
import { type FC, useEffect, useCallback, useRef } from "react";

import { isReEarthAPIv2 } from "../../../shared/reearth/types";
import { autoRotateCameraAtom } from "../states/app";

export interface AutoRotateCameraProps {
  degreesPerMinute?: number;
}

const Content: FC<AutoRotateCameraProps> = ({ degreesPerMinute = 180 }) => {
  const radianPerMilliseconds = (degreesPerMinute * Math.PI) / (60000 * 180);
  const camera = window.reearth?.camera;
  const dateRef = useRef<number>(Date.now());

  const handleTick = useCallback(() => {
    const now = Date.now();
    const elapsed = now - dateRef.current;
    if (isReEarthAPIv2(window.reearth)) {
      window.reearth?.camera?.rotateAround(radianPerMilliseconds * elapsed);
    } else {
      window.reearth?.camera?.rotateOnCenter(radianPerMilliseconds * elapsed);
    }
    dateRef.current = now;
  }, [radianPerMilliseconds]);

  const handleRotateOnTickEventAdd = (callback: (date: Date) => void) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.timeline?.on?.("tick", callback)
      : window.reearth?.on?.("tick", callback);
  };

  const handleRotateOnTickEventRemove = (callback: (date: Date) => void) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.timeline?.off?.("tick", callback)
      : window.reearth?.off?.("tick", callback);
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
  return enabled ? <Content {...props} /> : null;
};

import { useAtom } from "jotai";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { useCamera } from "../../../shared/reearth/hooks";
import { AppIconButton, CompassIcon } from "../../ui-components";
import { autoRotateCameraAtom } from "../states/app";

export const CompassButton: FC = () => {
  const [rotationAngle, setRotationAngle] = useState(0);

  const { getCameraPosition, flyTo } = useCamera();
  const camera = getCameraPosition();
  const [autoRotateCamera, setAutoRotateCameraAtom] = useAtom(autoRotateCameraAtom);
  const initialCamera = useRef(camera);

  const radianToDegree = useCallback((rad: number) => rad * (180 / Math.PI), []);

  useEffect(() => {
    if (camera?.heading) {
      setRotationAngle(360 - radianToDegree(camera?.heading));
    }
  }, [camera, camera?.heading, radianToDegree]);

  const handleClick = useCallback(() => {
    if (initialCamera.current) flyTo(initialCamera.current);
    if (autoRotateCamera) setAutoRotateCameraAtom(value => !value);
  }, [autoRotateCamera, flyTo, initialCamera, setAutoRotateCameraAtom]);

  return (
    <AppIconButton title="コンパス" onClick={handleClick}>
      <CompassIcon style={{ transform: `rotate(${rotationAngle}deg)` }} />
    </AppIconButton>
  );
};

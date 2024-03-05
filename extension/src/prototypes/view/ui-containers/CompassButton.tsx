import { useAtom } from "jotai";
import { FC, useCallback, useEffect, useState } from "react";

import { useCamera } from "../../../shared/reearth/hooks";
import { AppIconButton, CompassIcon } from "../../ui-components";
import { autoRotateCameraAtom } from "../states/app";

export const CompassButton: FC = () => {
  const [rotationAngle, setRotationAngle] = useState(0);

  const { getCameraPosition, flyTo } = useCamera();
  const camera = getCameraPosition();
  const radianToDegree = useCallback((rad: number) => rad * (180 / Math.PI), []);

  const [initialCamera] = useState(camera);

  useEffect(() => {
    if (camera?.heading) {
      setRotationAngle(360 - radianToDegree(camera?.heading));
    }
  }, [camera?.heading, radianToDegree]);

  const [autoRotateCamera, setAutoRotateCameraAtom] = useAtom(autoRotateCameraAtom);

  const handleClick = useCallback(() => {
    if (initialCamera) flyTo({ ...camera, heading: 0 });
    if (autoRotateCamera) setAutoRotateCameraAtom(value => !value);
  }, [autoRotateCamera, camera, flyTo, initialCamera, setAutoRotateCameraAtom]);

  return (
    <AppIconButton title="Navigator" onClick={handleClick}>
      <CompassIcon style={{ transform: `rotate(${rotationAngle}deg)` }} />
    </AppIconButton>
  );
};

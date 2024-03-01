import { FC, useCallback, useEffect, useState } from "react";

import { useCamera } from "../../../shared/reearth/hooks";
import { AppIconButton, CompassIcon } from "../../ui-components";

export const CompassButton: FC = () => {
  const [rotationAngle, setRotationAngle] = useState(0);

  const { getCameraPosition } = useCamera();
  const camera = getCameraPosition();
  const radianToDegree = useCallback((rad: number) => rad * (180 / Math.PI), []);

  useEffect(() => {
    if (camera?.heading) {
      setRotationAngle(360 - radianToDegree(camera?.heading));
    }
  }, [camera?.heading, radianToDegree]);

  return (
    <AppIconButton title="Navigator">
      <CompassIcon style={{ transform: `rotate(${rotationAngle}deg)` }} />
    </AppIconButton>
  );
};

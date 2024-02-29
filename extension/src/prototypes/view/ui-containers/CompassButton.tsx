import { FC, useEffect, useState } from "react";

import { useCamera } from "../../../shared/reearth/hooks";
import { AppIconButton, CompassIcon } from "../../ui-components";

export const CompassButton: FC = () => {
  const [rotationAngle, setRotationAngle] = useState(0);

  const { getCameraPosition } = useCamera();
  const camera = getCameraPosition();

  console.log("camera position", camera?.lat, camera?.lng);
  useEffect(() => {
    if (camera?.heading) {
      const headingDegrees = (camera.heading * 180) / Math.PI;
      setRotationAngle(headingDegrees);
    }
  }, [camera?.heading]);

  console.log("rotationAngle", rotationAngle);
  console.log("camera.height", camera?.heading);

  return (
    <AppIconButton title="Navigator">
      <CompassIcon style={{ transform: `rotate(${rotationAngle}deg)` }} />
    </AppIconButton>
  );
};

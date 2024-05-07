import { FC, useCallback, useMemo, useRef, useState } from "react";

import { useCamera, useReEarthEvent } from "../../reearth/hooks";
import { PolygonAppearances, PolygonLayer } from "../../reearth/layers";

const CAMERA_ZOOM_LEVEL_HEIGHT = 300000;
const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const [visible, setVisible] = useState(false);

  const timerRef = useRef<Promise<void>>();
  const updateVisibility = useCallback(async () => {
    const camera = getCameraPosition();
    if (camera?.height && camera.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
      await timerRef.current;
      setVisible(true);
    } else {
      if (timerRef.current) return;
      setVisible(false);
      timerRef.current = new Promise(r =>
        window.setTimeout(() => {
          timerRef.current = undefined;
          r();
        }, 500),
      );
    }
  }, [getCameraPosition]);

  useReEarthEvent("cameramove", updateVisibility);

  const appearances: PolygonAppearances = useMemo(
    () => ({
      resource: {
        fill: "rgba(0,190,190, 0.2)",
        stroke: "rgba(0, 190, 190, 0.2)",
        strokeWidth: 1,
        hideIndicator: true,
        clampToGround: true,
      },
      polygon: {
        classificationType: "terrain",
        fill: true,
        fillColor: "rgba(0, 190, 190, 0.2)",
        heightReference: "clamp",
        hideIndicator: true,
        selectedFeatureColor: "rgba(0, 190, 190, 0.4)",
      },
    }),
    [],
  );

  if (!visible) return null;

  return <PolygonLayer appearances={appearances} />;
};

export default JapanPlateauPolygon;

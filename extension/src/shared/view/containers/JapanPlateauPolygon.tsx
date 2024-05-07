import { FC, useCallback, useMemo, useRef, useState } from "react";

import { useCamera, useReEarthEvent } from "../../reearth/hooks";
import { PolygonAppearances, PolygonLayer } from "../../reearth/layers";

const CAMERA_ZOOM_LEVEL_HEIGHT = 300000;
const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const [visible, setVisible] = useState(false);
  const initializedRef = useRef(false);

  const timer = useRef<number>();
  const updateVisibility = useCallback(() => {
    if (timer.current) return;

    timer.current = window.setTimeout(() => {
      const camera = getCameraPosition();
      if (camera?.height && camera.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
        initializedRef.current = true;
        setVisible(true);
      } else {
        setVisible(false);
      }
      timer.current = undefined;
    }, 300);
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
        show: visible,
      },
      polygon: {
        classificationType: "terrain",
        fill: true,
        fillColor: "rgba(0, 190, 190, 0.2)",
        heightReference: "clamp",
        hideIndicator: true,
        selectedFeatureColor: "rgba(0, 190, 190, 0.4)",
        show: visible,
      },
    }),
    [visible],
  );

  if (!initializedRef.current) return;

  return <PolygonLayer appearances={appearances} />;
};

export default JapanPlateauPolygon;

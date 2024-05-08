import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCamera, useReEarthEvent } from "../../reearth/hooks";
import { PolygonAppearances, PolygonLayer } from "../../reearth/layers";

const CAMERA_ZOOM_LEVEL_HEIGHT = 300000;
const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);
  const revisibleRef = useRef(true);

  const updateVisibility = useCallback(async () => {
    if (!revisibleRef.current) return;

    const camera = getCameraPosition();
    if (camera?.height && camera.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
      setVisible(true);
      setShow(true);
    } else {
      setShow(false);
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
        show,
      },
      // polygon: {
      //   classificationType: "terrain",
      //   fill: true,
      //   fillColor: "rgba(0, 190, 190, 0.2)",
      //   heightReference: "clamp",
      //   hideIndicator: true,
      //   selectedFeatureColor: "rgba(0, 190, 190, 0.4)",
      //   show,
      // },
    }),
    [show],
  );

  const timerRef = useRef<number>();
  useEffect(() => {
    if (show || !revisibleRef.current) return;
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = undefined;
      revisibleRef.current = false;
      // Need to wait until the polygon is removed completely from Cesium.
      window.setTimeout(() => {
        revisibleRef.current = true;
      }, 3000);
    }, 3000);
    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [show]);

  if (!visible) return null;

  return <PolygonLayer appearances={appearances} />;
};

export default JapanPlateauPolygon;

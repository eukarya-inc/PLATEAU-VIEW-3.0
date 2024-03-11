import { FC, useEffect, useState } from "react";

import { useCamera } from "../../reearth/hooks";
import { PolygonAppearances, PolygonLayer } from "../../reearth/layers";

const CAMERA_ZOOM_LEVEL_HEIGHT = 300000;
const appererances: PolygonAppearances = {
  resource: {
    fill: "rgba(0, 190, 190, 0.5)",
    stroke: "rgba(0, 190, 190, 1)",
    strokeWidth: 1,
  },
  polygon: {
    heightReference: "clamp",
    classificationType: "terrain",
    fill: true,
    fillColor: "rgba(0, 190, 190, 0.5)",
    stroke: true,
    strokeColor: "rgba(0, 190, 190, 1)",
  },
};
const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const camera = getCameraPosition();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (camera?.height && camera.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
      setVisible(true);
    } else return setVisible(false);
  }, [camera?.height]);

  return <PolygonLayer visible={visible} appearances={appererances} />;
};

export default JapanPlateauPolygon;

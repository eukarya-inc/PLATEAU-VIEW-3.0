import { type FeatureCollection } from "geojson";
import { FC, useEffect, useState } from "react";

import { useCamera } from "../../reearth/hooks";
import { PolygonAppearances, PolygonLayer } from "../../reearth/layers";

const CAMERA_ZOOM_LEVEL_HEIGHT = 300000;
const sampleData: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: 1,
      properties: { id: "e12a1b" },
      geometry: {
        coordinates: [
          [
            [141.57874948634878, 45.3287044797344],
            [139.7748451146191, 43.04542664028486],
            [139.68123170750323, 41.35643658568614],
            [138.90922760378095, 38.30973643249979],
            [135.82285245202263, 36.242987486660354],
            [129.44857223692588, 33.70768495573108],
            [129.71466348654883, 31.526212784766713],
            [133.57186746679287, 32.07898997265063],
            [140.6877086195476, 34.497724147563176],
            [142.4727699133304, 37.820648814551134],
            [141.6449862832731, 41.857814683074906],
            [143.6390119784374, 41.72619582261561],
            [145.45990455585684, 42.59871850151396],
            [148.9694369587245, 45.704158488366744],
            [141.57874948634878, 45.3287044797344],
          ],
        ],
        type: "Polygon",
      },
    },
  ],
};

const appererances: PolygonAppearances = {
  polygon: {
    heightReference: "clamp",
    classificationType: "terrain",
    fill: true,
    fillColor: {
      expression: "color('#00BEBE',0.5)",
    },
    stroke: true,
    strokeColor: {
      expression: "color('#00BEBE')",
    },
  },
};

const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const camera = getCameraPosition();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (camera?.height && camera?.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
      setVisible(true);
    } else return setVisible(false);
  }, [camera?.height]);

  return <PolygonLayer visible={visible} polygonFeatures={sampleData} appearances={appererances} />;
};

export default JapanPlateauPolygon;

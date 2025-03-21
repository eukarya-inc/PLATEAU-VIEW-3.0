import { useAtomValue } from "jotai";
import { useMemo, type FC } from "react";

import { SceneProps, Scene } from "../../../shared/reearth/scene";
import { enableTerrainLightingAtom } from "../states/app";

// TODO: Create time-based interpolation of sky atmosphere.
// Spherical harmonic coefficients generated from a modified version of:
// https://polyhaven.com/a/teufelsberg_ground_2
const sphericalHarmonicCoefficients: [x: number, y: number, z: number][] = [
  [1.221931219100952, 1.266084671020508, 1.019550442695618],
  [0.800345599651337, 0.841745376586914, 0.723761379718781],
  [0.912390112876892, 0.922998011112213, 0.649103164672852],
  [-0.843475937843323, -0.853787302970886, -0.601324439048767],
  [-0.495116978883743, -0.5034259557724, -0.360104471445084],
  [0.497776478528976, 0.507052302360535, 0.364346027374268],
  [0.082192525267601, 0.082608506083488, 0.056836795061827],
  [-0.925247848033905, -0.940086245536804, -0.678709805011749],
  [0.114833705127239, 0.114355310797691, 0.067587599158287],
];

export const SatelliteEnvironment: FC<SceneProps> = ({ tileLabels, ...props }) => {
  const enableTerrainLighting = useAtomValue(enableTerrainLightingAtom);

  // const [layer, setLayer] = useState<ImageryLayerHandle | null>(null);
  // useEffect(() => {
  //   layer?.sendToBack();
  // }, [layer]);

  const tiles = useMemo(
    () => [
      {
        id: "tokyo_1",
        tile_url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
        tile_type: "url",
      },
      {
        id: "tokyo_2",
        tile_url: "https://api.plateauview.mlit.go.jp/tiles/plateau-ortho-2024/{z}/{x}/{y}.png",
        tile_type: "url",
      },
    ],
    [],
  );

  return (
    <Scene
      enableGlobeLighting={enableTerrainLighting}
      lightIntensity={2}
      shadowDarkness={0.5}
      sphericalHarmonicCoefficients={sphericalHarmonicCoefficients}
      tiles={tiles}
      tileLabels={tileLabels}
      {...props}
    />
  );
};

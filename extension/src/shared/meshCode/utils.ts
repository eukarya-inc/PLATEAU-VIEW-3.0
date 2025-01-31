import jismesh from "jismesh-js";

export const getCoordinatesFromMeshCode = (meshCode: string): [number, number][][] => {
  const [latSW, lonSW] = jismesh.toMeshPoint(meshCode, 0, 0);
  const [latSE, lonSE] = jismesh.toMeshPoint(meshCode, 0, 1);
  const [latNE, lonNE] = jismesh.toMeshPoint(meshCode, 1, 1);
  const [latNW, lonNW] = jismesh.toMeshPoint(meshCode, 1, 0);
  return [
    [
      [lonSW, latSW],
      [lonSE, latSE],
      [lonNE, latNE],
      [lonNW, latNW],
      [lonSW, latSW],
    ],
  ];
};

export const getMeshCodeLevelByType = (type: "2x" | "3x"): number => (type === "2x" ? 2 : 3);

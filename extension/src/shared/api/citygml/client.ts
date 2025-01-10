import { fetchWithGet } from "../fetch";

import { CityGMLGetFilesParams } from "./types";

export class CityGMLClient {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  handleError(obj: any) {
    if (!obj) return;
    if (typeof obj !== "object") return;
    if ("error" in obj) {
      console.error(obj.error);
      return;
    }
    return obj;
  }

  async getFiles(params: CityGMLGetFilesParams) {
    const conditions = makeFileAPIConditionsByParams(params);
    return this.handleError(
      await fetchWithGet(`${this.url}/${conditions}`).catch((e: any) => {
        console.error(e);
      }),
    );
  }
}

function makeFileAPIConditionsByParams(params: CityGMLGetFilesParams) {
  const { meshId, spaceZFXYStr, spaceId, centerCoordinate, rangeCoordinates, geoName, cityIds } =
    params;
  if (meshId) return `m:${meshId}`;
  if (spaceZFXYStr) return `s:${spaceZFXYStr}`;
  if (spaceId) return `s:${spaceId}`;
  if (centerCoordinate) {
    const { lng, lat } = centerCoordinate;
    return `r:${lng},${lat}`;
  }
  if (rangeCoordinates) {
    const { lng1, lat1, lng2, lat2 } = rangeCoordinates;
    return `r:${lng1},${lat1},${lng2},${lat2}`;
  }
  if (geoName) return `g:${geoName}`;
  if (cityIds && cityIds.length > 0) return cityIds.join(",");
  return;
}

import { type Readable } from "stream";

import { type Coordinates } from "@prototypes/nest-vector-tile/interfaces/Coordinates";
import { type TileFormat } from "@prototypes/nest-vector-tile/interfaces/TileFormat";
import { type Sharp } from "sharp";

export interface TileCache {
  get: (
    name: string,
    coords: Coordinates,
    format: TileFormat,
  ) => Promise<Readable | string | undefined>;
  set: (name: string, coords: Coordinates, format: TileFormat, image: Sharp) => Promise<void>;
}

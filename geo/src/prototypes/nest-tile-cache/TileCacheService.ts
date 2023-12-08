import { Readable } from "stream";

import { Inject, Injectable } from "@nestjs/common";
import { type Coordinates, type TileFormat } from "@prototypes/type-helpers";
import { type Sharp } from "sharp";
import invariant from "tiny-invariant";

import { TILE_CACHE } from "./constants";
import { type TileCache } from "./interfaces/TileCache";

export interface RenderTileOptions {
  format?: TileFormat;
}

function applyFormat(image: Sharp, format: TileFormat): Sharp {
  return format === "webp" ? image.webp({ lossless: true }) : image.png();
}

@Injectable()
export class TileCacheService {
  constructor(
    @Inject(TILE_CACHE)
    private readonly cache: TileCache | undefined,
  ) {}

  async findOne(
    path: string,
    coords: Coordinates,
    { format = "webp" }: RenderTileOptions = {},
  ): Promise<Readable | string | undefined> {
    return this.cache != null ? await this.cache.get(path, coords, format) : undefined;
  }

  async createOne(
    image: Sharp,
    path: string,
    coords: Coordinates,
    { format = "webp" }: RenderTileOptions = {},
  ): Promise<Readable | string | undefined> {
    console.log(this.cache);
    if (this.cache != null) {
      (async () => {
        invariant(this.cache != null);

        await this.cache.set(path, coords, format, applyFormat(image, format));
      })().catch(error => {
        console.error(error);
      });
    }
    return Readable.from(await applyFormat(image, format).toBuffer());
  }
}

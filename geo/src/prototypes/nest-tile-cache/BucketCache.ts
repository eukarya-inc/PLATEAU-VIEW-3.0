import path from "path";
import { type Readable } from "stream";

import { Storage, type Bucket } from "@google-cloud/storage";
import { type Coordinates, type TileFormat } from "@prototypes/type-helpers";
import { type Sharp } from "sharp";
import invariant from "tiny-invariant";

import { type TileCache } from "./interfaces/TileCache";

export class BucketCache implements TileCache {
  private readonly storage = new Storage();
  private readonly bucket: Bucket;
  private readonly bucketRoot: string;

  constructor(cacheRoot: string) {
    const url = new URL(cacheRoot);
    invariant(url.protocol === "gs:");
    this.bucket = this.storage.bucket(url.host);
    this.bucketRoot = url.pathname.slice(1);
  }

  private makePath(name: string, coords: Coordinates, format: TileFormat): string {
    const { x, y, level } = coords;
    return path.join(this.bucketRoot, name, `${level}/${x}/${y}.${format}`);
  }

  async get(
    name: string,
    coords: Coordinates,
    format: TileFormat,
  ): Promise<string | Readable | undefined> {
    const file = this.bucket.file(this.makePath(name, coords, format));
    const [exists] = await file.exists();
    return exists ? file.createReadStream() : undefined;
  }

  async set(name: string, coords: Coordinates, format: TileFormat, image: Sharp): Promise<void> {
    const file = this.bucket.file(this.makePath(name, coords, format));
    await new Promise((resolve, reject) => {
      image
        .pipe(file.createWriteStream())
        .on("close", resolve)
        .on("error", error => {
          reject(error);
        });
    });
  }
}

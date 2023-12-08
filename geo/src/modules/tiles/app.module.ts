import { Module } from "@nestjs/common";
import { TerrainTileModule } from "@prototypes/nest-terrain-tile";
import { TileCacheModule } from "@prototypes/nest-tile-cache";
import { VectorTileModule } from "@prototypes/nest-vector-tile";
import { darkStyle, lightStyle } from "@prototypes/vector-map-style";

import { TileAppController } from "./app.controller";
import { TileAppService } from "./app.service";

@Module({
  imports: [
    TileCacheModule.forRootAsync({
      // if you don't use useFactory process.env.TILE_CACHE_ROOT will be undefined.
      // source: https://stackoverflow.com/questions/67482900/nestjs-not-reading-environmental-variables
      useFactory: () => {
        return {
          cacheRoot: process.env.TILE_CACHE_ROOT !== "" ? process.env.TILE_CACHE_ROOT : undefined,
        };
      },
    }),
    // This is for browser level cache.
    VectorTileModule.forRoot({
      disableCache: process.env.TILE_CACHE_ROOT == null || process.env.TILE_CACHE_ROOT === "",
    }),
    // maximumLevel must be +1 of imagery layer's maximum level because tiles
    // are rendered with pixel ratio 2.
    VectorTileModule.forFeature({
      path: "light-map",
      mapStyle: lightStyle,
      maximumLevel: 23,
      minimumDataLevel: 4,
      maximumDataLevel: 16,
    }),
    VectorTileModule.forFeature({
      path: "dark-map",
      mapStyle: darkStyle,
      maximumLevel: 23,
      minimumDataLevel: 4,
      maximumDataLevel: 16,
    }),
    TerrainTileModule.forRoot({
      path: "terrain",
      disableCache: true,
      // disableCache:
      //   process.env.TILE_CACHE_ROOT == null ||
      //   process.env.TILE_CACHE_ROOT === ''
    }),
  ],
  controllers: [TileAppController],
  providers: [TileAppService],
})
export class TileAppModule {}

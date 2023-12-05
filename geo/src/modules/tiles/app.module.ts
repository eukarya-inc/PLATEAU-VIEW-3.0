import { Module } from "@nestjs/common";
import { TileCacheModule } from "@prototypes/nest-tile-cache";
import { VectorTileModule } from "@prototypes/nest-vector-tile";
import { darkStyle, lightStyle } from "@prototypes/vector-map-style";

import { TileAppController } from "./app.controller";
import { TileAppService } from "./app.service";

@Module({
  imports: [
    TileCacheModule.forRoot({
      // TODO: Make this come from process.env.. Facing issue with configModule
      // process.env.TILE_CACHE_ROOT comes as undefined - https://stackoverflow.com/questions/67482900/nestjs-not-reading-environmental-variables
      cacheRoot: "cache",
    }),
    // Cache disabled for now
    // This is for browser level cache.
    // TODO: Make this true when everything is tested properly
    VectorTileModule.forRoot({
      disableCache: true,
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
  ],
  controllers: [TileAppController],
  providers: [TileAppService],
})
export class TileAppModule {}

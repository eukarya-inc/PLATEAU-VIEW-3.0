import { Module } from "@nestjs/common";
import { TerrainTileModule } from "@prototypes/nest-terrain-tile";

@Module({
  imports: [
    TerrainTileModule.forRoot({
      path: "terrain",
      disableCache: process.env.TILE_CACHE_ROOT == null || process.env.TILE_CACHE_ROOT === "",
    }),
  ],
})
export class TerrainModule {}

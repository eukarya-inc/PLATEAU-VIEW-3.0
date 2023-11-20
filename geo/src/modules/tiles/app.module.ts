import { Module } from "@nestjs/common";

import { VectorTileModule } from "../../prototypes/nest-vector-tile/src/index";
import { darkStyle, lightStyle } from "../../prototypes/vector-map-style/src/index";

import { TileAppController } from "./app.controller";
import { TileAppService } from "./app.service";

@Module({
  imports: [
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

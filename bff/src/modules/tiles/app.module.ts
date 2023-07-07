import { Module } from "@nestjs/common";
import { TileAppController } from "./app.controller";
import { TileAppService } from "./app.service";

@Module({
  imports: [],
  controllers: [TileAppController],
  providers: [TileAppService],
})
export class TileAppModule {}

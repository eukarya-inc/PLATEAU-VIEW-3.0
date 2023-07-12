import { Module } from "@nestjs/common";

import { GraphQLAppModule } from "./modules/graphql/app.module";
import { TileAppModule } from "./modules/tiles/app.module";

@Module({
  imports: [GraphQLAppModule, TileAppModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

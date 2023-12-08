import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GraphQLAppModule } from "./modules/graphql/app.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GraphQLAppModule,
    ...(process.env.ENABLE_TILE_SERVER
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        [require("./modules/tiles/app.module").TileAppModule]
      : []),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

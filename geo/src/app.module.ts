import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GraphQLAppModule } from "./modules/graphql/app.module";
import { TileAppModule } from "./modules/tiles/app.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GraphQLAppModule,
    TileAppModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

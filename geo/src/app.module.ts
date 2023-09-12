import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GraphQLAppModule } from "./modules/graphql/app.module";
import { TileAppModule } from "./modules/tiles/app.module";

@Module({
  imports: [
    GraphQLAppModule,
    TileAppModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

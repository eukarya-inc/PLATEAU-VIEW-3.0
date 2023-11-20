import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GraphQLAppModule } from "./modules/graphql/app.module";
import { TileAppModule } from "./modules/tiles/app.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    // TODO: Fix this
    // GraphQLAppModule,
    TileAppModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

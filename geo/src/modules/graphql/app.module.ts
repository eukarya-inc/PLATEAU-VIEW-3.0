import { join } from "path";

import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";

import { GraphQLAppController } from "./app.controller";
import { GraphQLAppService } from "./app.service";
import { AreasModule } from "./modules/areas.module";
import { HealthModule } from "./modules/health.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cache: "bounded",
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      include: [HealthModule, AreasModule],
    }),
    HealthModule,
    AreasModule,
  ],
  controllers: [GraphQLAppController],
  providers: [GraphQLAppService],
})
export class GraphQLAppModule {}

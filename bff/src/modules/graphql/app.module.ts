import { Module } from "@nestjs/common";
import { GraphQLAppController } from "./app.controller";
import { GraphQLAppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { HealthModule } from "./modules/health.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cache: "bounded",
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
    }),
    HealthModule,
  ],
  controllers: [GraphQLAppController],
  providers: [GraphQLAppService],
})
export class GraphQLAppModule {}

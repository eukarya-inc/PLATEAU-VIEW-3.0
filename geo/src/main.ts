import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const PORT = process.env.PORT && !isNaN(Number(process.env.PORT)) ? Number(process.env.PORT) : 5002;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: JSON.parse(process.env.ALLOW_ORIGIN),
    methods: ["GET", "OPTION"],
    maxAge: 3600,
  });
  console.log("PORT:", PORT);
  await app.listen(PORT);
}
bootstrap();

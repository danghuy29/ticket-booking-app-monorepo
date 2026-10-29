import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./config/env";
import { API_PREFIX, DEFAULT_API_VERSION, setupApp } from "./setup-app";

const app = await NestFactory.create(AppModule);
setupApp(app, { corsOrigins: env.CORS_ORIGINS });

await app.listen(env.PORT);
Logger.log(
  `API ready at http://localhost:${env.PORT}/${API_PREFIX}/v${DEFAULT_API_VERSION}`,
  "Bootstrap",
);

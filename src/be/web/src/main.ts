import { NestFactory } from "@nestjs/core";
import { INestApplication } from "@nestjs/common/interfaces";
import { AppModule } from "./app.module";
import { Config } from "./config";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  console.log(`[start up] BONDUC_ENV: ${process.env.BONDUC_ENV}`);
  let app: INestApplication = null;
  if (Config.isLocalEnv) {
    app = await NestFactory.create(AppModule, {
      logger: ["debug", "verbose", "log", "warn", "error"]
    });
  } else {
    app = await NestFactory.create(AppModule, { logger: ["log", "warn", "error"] });
  }

  app.use(cookieParser(Config.cookie.secret));
  await app.listen(3333);
}
bootstrap();

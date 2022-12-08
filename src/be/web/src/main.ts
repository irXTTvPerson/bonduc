import { NestFactory } from "@nestjs/core";
import { INestApplication } from "@nestjs/common/interfaces";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  console.log(`[start up] BONDUC_ENV: ${process.env.BONDUC_ENV}`);
  let app: INestApplication = null;
  if (process.env.BONDUC_ENV === "local") {
    app = await NestFactory.create(AppModule, {
      logger: ["debug", "verbose", "log", "warn", "error"]
    });
  } else {
    app = await NestFactory.create(AppModule, { logger: ["log", "warn", "error"] });
  }

  app.use(cookieParser(process.env.COOKIE_SECRET_TOKEN));
  app.enableCors({
    origin: new RegExp(`(${process.env.CORS_ORIGIN}|${process.env.NEXT_PUBLIC_FE_WEB_URL})`),
    methods: "DELETE, OPTIONS",
    credentials: true,
    allowedHeaders: "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  });
  await app.listen(3333);
}
bootstrap();

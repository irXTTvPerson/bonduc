import { NestFactory } from "@nestjs/core";
import { INestApplication } from "@nestjs/common/interfaces";
import { AppModule } from "./app.module";
import { Config } from "./config";
import * as cookieParser from "cookie-parser";
import { prisma, pool } from "./lib/prisma";
import { redis } from "./lib/redis";

const onExit = async () => {
  try {
    await prisma.$disconnect();
    for (const p of pool) {
      await p.$disconnect();
    }
    await redis.disconnect();
  } catch {
  } finally {
    console.log(`[shutdown] BONDUC disconnected`);
  }
};

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
  app.enableCors({
    origin: new RegExp(`(${Config.corsOrigin}|${Config.feEndpoint})`),
    methods: "DELETE, OPTIONS",
    credentials: true,
    allowedHeaders: "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  });
  await app.listen(3333);

  process.on("beforeExit", async () => await onExit());
  process.on("exit", async () => await onExit());
  process.on("SIGTERM", async () => await onExit());
  process.on("SIGINT", async () => await onExit());
}
bootstrap();

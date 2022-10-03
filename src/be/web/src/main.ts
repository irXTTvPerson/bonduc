import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (process.env.BONDUC_ENV === "local") {
    console.log(`[start up] BONDUC_ENV: ${process.env.BONDUC_ENV}`);
    const app = await NestFactory.create(AppModule, {
      logger: ["debug", "verbose", "log", "warn", "error"]
    });
    await app.listen(3333);
  } else {
    console.log(`[start up] BONDUC_ENV: ${process.env.BONDUC_ENV}`);
    const app = await NestFactory.create(AppModule, { logger: ["log", "warn", "error"] });
    await app.listen(3333);
  }
}
bootstrap();

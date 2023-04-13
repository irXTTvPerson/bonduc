import { Module } from "@nestjs/common";
import { PodController } from "./pod.controller";
import { PodService } from "./pod.service";
import { DBModule } from "src/db/db.module";

@Module({
  imports: [DBModule],
  controllers: [PodController],
  providers: [PodService]
})
export class PodModule {}

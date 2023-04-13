import { Module } from "@nestjs/common";
import { ATLController } from "./atl.controller";
import { ATLService } from "./atl.service";
import { DBModule } from "src/db/db.module";

@Module({
  imports: [DBModule],
  controllers: [ATLController],
  providers: [ATLService]
})
export class ATLModule { }

import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DBModule } from "../db/db.module";

@Module({
  imports: [DBModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}

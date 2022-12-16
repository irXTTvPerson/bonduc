import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { UnregisterService } from "./unregister/unregister.service";
import { AuthService } from "./auth.service";
import { DBModule } from "../db/db.module";

@Module({
  imports: [DBModule],
  controllers: [AuthController],
  providers: [RegisterService, DraftAccountService, UnregisterService, AuthService],
  exports: [DBModule]
})
export class AuthModule {}

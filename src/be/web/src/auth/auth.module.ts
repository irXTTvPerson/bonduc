import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { UnregisterService } from "./unregister/unregister.service";
import { AuthService } from "./auth.service";
@Module({
  controllers: [AuthController],
  providers: [RegisterService, DraftAccountService, UnregisterService, AuthService]
})
export class AuthModule {}

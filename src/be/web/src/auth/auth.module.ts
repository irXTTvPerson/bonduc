import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { EmailService } from "../email/email.service";
import { UnregisterService } from "./unregister/unregister.service";

@Module({
  controllers: [AuthController],
  providers: [RegisterService, DraftAccountService, UnregisterService, EmailService]
})
export class AuthModule {}

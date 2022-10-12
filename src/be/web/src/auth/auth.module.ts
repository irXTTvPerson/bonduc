import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { EmailService } from "../email/email.service";
import { UnregisterService } from "./unregister/unregister.service";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "../config";
import { JwtStrategy } from "./jwt.strategy";
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: Config.jwt.secret,
      signOptions: { expiresIn: Config.jwt.expire }
    })
  ],
  controllers: [AuthController],
  providers: [
    RegisterService,
    DraftAccountService,
    UnregisterService,
    EmailService,
    AuthService,
    LocalStrategy,
    JwtStrategy
  ]
})
export class AuthModule {}

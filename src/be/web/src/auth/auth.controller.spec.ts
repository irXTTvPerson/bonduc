import { Test, TestingModule } from "@nestjs/testing";
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

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        LocalStrategy
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});

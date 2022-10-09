import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "../config";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { EmailService } from "../email/email.service";
import { UnregisterService } from "./unregister/unregister.service";

describe("AuthService", () => {
  let service: AuthService;

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

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

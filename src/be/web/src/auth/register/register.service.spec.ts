import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "../../email/email.service";
import { AuthController } from "../auth.controller";
import { UnregisterService } from "../unregister/unregister.service";
import { DraftAccountService } from "./draft/draftAccount.service";
import { RegisterService } from "./register.service";
import { AuthService } from "../auth.service";
import { LocalStrategy } from "../local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "../../config";

describe("RegisterService", () => {
  let service: RegisterService;

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

    service = module.get<RegisterService>(RegisterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

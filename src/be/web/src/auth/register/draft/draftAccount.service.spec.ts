import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../auth.controller";
import { EmailService } from "../../../email/email.service";
import { DraftAccountService } from "./draftAccount.service";
import { RegisterService } from "../register.service";
import { UnregisterService } from "../../unregister/unregister.service";
import { AuthService } from "../../auth.service";
import { LocalStrategy } from "../../local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "../../../config";

describe("DraftAccountService", () => {
  let service: DraftAccountService;

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
        DraftAccountService,
        RegisterService,
        UnregisterService,
        EmailService,
        AuthService,
        LocalStrategy
      ]
    }).compile();

    service = module.get<DraftAccountService>(DraftAccountService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

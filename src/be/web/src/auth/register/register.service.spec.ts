import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "../../email/email.service";
import { AuthController } from "../auth.controller";
import { UnregisterService } from "../unregister/unregister.service";
import { DraftAccountService } from "./draft/draftAccount.service";
import { RegisterService } from "./register.service";

describe("RegisterService", () => {
  let service: RegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [RegisterService, DraftAccountService, UnregisterService, EmailService]
    }).compile();

    service = module.get<RegisterService>(RegisterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

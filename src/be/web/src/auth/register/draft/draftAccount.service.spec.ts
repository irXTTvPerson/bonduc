import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../auth.controller";
import { EmailService } from "../../../email/email.service";
import { DraftAccountService } from "./draftAccount.service";

describe("DraftAccountService", () => {
  let service: DraftAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [DraftAccountService, EmailService]
    }).compile();

    service = module.get<DraftAccountService>(DraftAccountService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

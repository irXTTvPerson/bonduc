import { Test, TestingModule } from "@nestjs/testing";
import { DraftAccountService } from "./draftAccount.service";

describe("DraftAccountService", () => {
  let service: DraftAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DraftAccountService]
    }).compile();

    service = module.get<DraftAccountService>(DraftAccountService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

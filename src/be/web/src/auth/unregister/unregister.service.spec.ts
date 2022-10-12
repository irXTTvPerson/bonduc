import { Test, TestingModule } from "@nestjs/testing";
import { UnregisterService } from "./unregister.service";

describe("UnregisterService", () => {
  let service: UnregisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnregisterService]
    }).compile();

    service = module.get<UnregisterService>(UnregisterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

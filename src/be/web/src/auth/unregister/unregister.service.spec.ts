import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { DraftAccountService } from "../register/draft/draftAccount.service";
import { RegisterService } from "../register/register.service";
import { AuthService } from "../auth.service";
import { prisma } from "../../lib/prisma";
import { hash } from "../../lib/hash";
import { UnregisterService } from "./unregister.service";
import { execSync } from "child_process";

describe("UnregisterService", () => {
  let service: UnregisterService;

  const validData = {
    ip_address: ["127.0.0.1"],
    email: "a@b.com",
    password: "password",
    screen_name: "screen",
    identifier_name: "identifier"
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [RegisterService, DraftAccountService, UnregisterService, AuthService]
    }).compile();

    service = module.get<UnregisterService>(UnregisterService);
  });

  describe("Valid", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("normal", async () => {
      const d = Object.assign({}, validData);
      d.password = hash(d.password);
      await prisma.account.create({ data: d });
      d.password = "password";
      const ret = await service.unregister(d);
      expect(ret).toEqual(204);
    });
  });

  describe("Should be Error", () => {
    beforeEach(async () => {
      await prisma.draftAccount.deleteMany();
      await prisma.account.deleteMany();
    });

    afterEach(async () => {
      await prisma.draftAccount.deleteMany();
      await prisma.account.deleteMany();
    });

    it("can't delete not existing Account", async () => {
      const d = Object.assign({}, validData);
      d.password = hash(d.password);
      const ret = await service.unregister(d);
      expect(ret).toEqual(404);
    });

    it("password mismatcg", async () => {
      const d = Object.assign({}, validData);
      d.password = hash(d.password);
      await prisma.account.create({ data: d });
      d.password = "password0";
      const ret = await service.unregister(d);
      expect(ret).toEqual(400);
    });
  });
});

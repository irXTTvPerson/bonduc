import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { UnregisterService } from "./unregister/unregister.service";
import { prisma } from "../lib/prisma";
import { execSync } from "child_process";

describe("AuthService", () => {
  let service: AuthService;

  const validData = {
    ip_address: ["127.0.0.1"],
    email: "a@b.com",
    // password on sha3-512
    password:
      "e9a75486736a550af4fea861e2378305c4a555a05094dee1dca2f68afea49cc3a50e8de6ea131ea521311f4d6fb054a146e8282f8e35ff2e6368c1a62e909716",
    screen_name: "screen",
    identifier_name: "identifier",
    account_unique_uri: "hoge"
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [RegisterService, DraftAccountService, UnregisterService, AuthService]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("Valid", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("normal", async () => {
      await prisma.account.create({ data: validData });
      const ret = await service.login({ email: validData.email, password: "password" });
      expect(ret).not.toBeNull();
    });
  });

  describe("Should be Error", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("account not found", async () => {
      const ret = await service.login({ email: validData.email, password: "password" });
      expect(ret).toBeNull();
    });

    it("invalid password", async () => {
      await prisma.account.create({ data: validData });
      const ret = await service.login({ email: validData.email, password: "password0" });
      expect(ret).toBeNull();
    });

    it("invalid email", async () => {
      await prisma.account.create({ data: validData });
      const ret = await service.login({ email: validData.email + "hoge", password: "password" });
      expect(ret).toBeNull();
    });
  });
});

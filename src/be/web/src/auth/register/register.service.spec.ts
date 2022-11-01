import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { UnregisterService } from "../unregister/unregister.service";
import { DraftAccountService } from "./draft/draftAccount.service";
import { RegisterService } from "./register.service";
import { AuthService } from "../auth.service";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { hash } from "../../lib/hash";
import { execSync } from "child_process";

describe("RegisterService", () => {
  let service: RegisterService;

  const validData = {
    address: "127.0.0.1",
    family: "IpV4",
    email: "a@b.com",
    // password on sha3-512
    password:
      "e9a75486736a550af4fea861e2378305c4a555a05094dee1dca2f68afea49cc3a50e8de6ea131ea521311f4d6fb054a146e8282f8e35ff2e6368c1a62e909716",
    screen_name: "screen",
    identifier_name: "identifier",
    created_at: new Date(),
    token: hash(randomUUID())
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [RegisterService, DraftAccountService, UnregisterService, AuthService]
    }).compile();

    service = module.get<RegisterService>(RegisterService);
  });

  describe("Valid", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("normal", async () => {
      const ac = await prisma.draftAccount.create({ data: validData });
      expect(ac).not.toBeNull();
      expect(ac).not.toBeUndefined();

      const ret = await service.register(validData.token);
      expect(ret).toEqual(204);

      const res = await prisma.draftAccount.findFirst({ where: ac });
      expect(res).toBeNull();
    });
  });

  describe("Should be Error", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("can't create Account without DraftAccount", async () => {
      const token = hash(randomUUID());
      const ret = await service.register(token);
      expect(ret).toEqual(404);
    });

    it("can't create same Account", async () => {
      const ac = await prisma.draftAccount.create({ data: validData });
      expect(ac).not.toBeNull();
      expect(ac).not.toBeUndefined();

      let ret = await service.register(validData.token);
      expect(ret).toEqual(204);
      let res = await prisma.draftAccount.findFirst({ where: ac });
      expect(res).toBeNull();

      ret = await service.register(validData.token);
      expect(ret).toEqual(404);
      res = await prisma.draftAccount.findFirst({ where: ac });
      expect(res).toBeNull();
    });
  });
});

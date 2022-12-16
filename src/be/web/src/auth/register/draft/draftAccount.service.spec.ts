import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../auth.controller";
import { DraftAccountService } from "./draftAccount.service";
import { RegisterService } from "../register.service";
import { UnregisterService } from "../../unregister/unregister.service";
import { AuthService } from "../../auth.service";
import { prisma } from "../../../lib/prisma";
import { randomUUID } from "crypto";
import { hash } from "../../../lib/hash";
import { execSync } from "child_process";

describe("DraftAccountService", () => {
  let service: DraftAccountService;

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
      providers: [DraftAccountService, RegisterService, UnregisterService, AuthService]
    }).compile();

    service = module.get<DraftAccountService>(DraftAccountService);
  });

  describe("Valid", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("normal", async () => {
      const ret = await service.register(validData);
      expect(ret).toEqual(204);
    });

    it("create different one", async () => {
      let ret = await service.register(validData);
      expect(ret).toEqual(204);

      const d = Object.assign({}, validData);
      d.address += "123";
      d.email += "hoge";
      d.identifier_name += "fuga";
      d.token += "123";
      ret = await service.register(d);
      expect(ret).toEqual(204);
    });

    it("create DraftAccount not conflicted with Account", async () => {
      await prisma.account.create({
        data: {
          email: validData.email,
          password: validData.password,
          identifier_name: validData.identifier_name,
          screen_name: validData.screen_name,
          ip_address: ["127.0.0.1"],
          account_unique_uri: "hoge",
          inbox: `inbox`,
          outbox: `outbox`,
          follower_uri: `follower`,
          following_uri: `following`
        }
      });

      const a = Object.assign({}, validData);
      a.email += "hoge";
      a.identifier_name += "fuga";
      const ret = await service.register(a);
      expect(ret).toEqual(204);
    });
  });

  describe("Should be Error", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("can't create same data", async () => {
      let ret = await service.register(validData);
      expect(ret).toEqual(204);
      ret = await service.register(validData);
      expect(ret).toEqual(409);
    });

    it("can't create due to unique constraint", async () => {
      let ret = await service.register(validData);
      expect(ret).toEqual(204);

      const a = Object.assign({}, validData);
      a.address += "123";
      ret = await service.register(a);
      expect(ret).toEqual(409);

      const b = Object.assign({}, validData);
      b.email += "hoge";
      ret = await service.register(b);
      expect(ret).toEqual(409);

      const c = Object.assign({}, validData);
      c.identifier_name += "fuga";
      ret = await service.register(c);
      expect(ret).toEqual(409);

      const d = Object.assign({}, validData);
      d.token += "123";
      ret = await service.register(d);
      expect(ret).toEqual(409);
    });

    it("can't create DraftAccount if Account already taken", async () => {
      await prisma.account.create({
        data: {
          email: validData.email,
          password: validData.password,
          identifier_name: validData.identifier_name,
          screen_name: validData.screen_name,
          ip_address: ["127.0.0.1"],
          account_unique_uri: "hoge",
          inbox: `inbox`,
          outbox: `outbox`,
          follower_uri: `follower`,
          following_uri: `following`
        }
      });
      const a = Object.assign({}, validData);
      a.email += "hoge";
      let ret = await service.register(a);
      expect(ret).toEqual(409);

      const b = Object.assign({}, validData);
      b.identifier_name += "fuga";
      ret = await service.register(b);
      expect(ret).toEqual(409);
    });
  });
});

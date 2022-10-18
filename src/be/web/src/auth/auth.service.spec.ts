import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "../config";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register/register.service";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { UnregisterService } from "./unregister/unregister.service";
import { prisma } from "../lib/prisma";

describe("AuthService", () => {
  let service: AuthService;

  const validData = {
    ip_address: ["127.0.0.1"],
    email: "a@b.com",
    // password on sha3-512
    password:
      "e9a75486736a550af4fea861e2378305c4a555a05094dee1dca2f68afea49cc3a50e8de6ea131ea521311f4d6fb054a146e8282f8e35ff2e6368c1a62e909716",
    screen_name: "screen",
    identifier_name: "identifier"
  };

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
        AuthService,
        LocalStrategy
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("Valid", () => {
    beforeEach(async () => {
      await prisma.draftAccount.deleteMany();
      await prisma.account.deleteMany();
    });

    afterEach(async () => {
      await prisma.draftAccount.deleteMany();
      await prisma.account.deleteMany();
    });

    it("normal", async () => {
      await prisma.account.create({ data: validData });
      const ret = await service.validateUser(validData.email, "password");
      expect(ret).not.toBeNull();
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

    it("account not found", async () => {
      const ret = await service.validateUser(validData.email, "password");
      expect(ret).toBeNull();
    });

    it("invalid password", async () => {
      await prisma.account.create({ data: validData });
      const ret = await service.validateUser(validData.email, "password0");
      expect(ret).toBeNull();
    });

    it("invalid email", async () => {
      await prisma.account.create({ data: validData });
      const ret = await service.validateUser(validData.email + "hoge", "password");
      expect(ret).toBeNull();
    });
  });
});

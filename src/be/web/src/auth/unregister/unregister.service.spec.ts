import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "../../email/email.service";
import { AuthController } from "../auth.controller";
import { DraftAccountService } from "../register/draft/draftAccount.service";
import { RegisterService } from "../register/register.service";
import { AuthService } from "../auth.service";
import { LocalStrategy } from "../local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "../../config";
import { prisma } from "../../lib/prisma";
import { hash } from "../../lib/hash";
import { UnregisterService } from "./unregister.service";

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
        EmailService,
        AuthService,
        LocalStrategy
      ]
    }).compile();

    service = module.get<UnregisterService>(UnregisterService);
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

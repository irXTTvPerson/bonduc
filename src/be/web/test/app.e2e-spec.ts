import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { prisma } from "../src/lib/prisma";
import { execSync } from "child_process";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  const draft = {
    email: "a@b.c",
    password: "password",
    address: "127.0.0.1",
    family: "IpV4",
    screen_name: "screen",
    identifier_name: "identifier"
  };

  const account = {
    ip_address: ["127.0.0.1"],
    email: "a@b.com",
    // password on sha3-512
    password:
      "e9a75486736a550af4fea861e2378305c4a555a05094dee1dca2f68afea49cc3a50e8de6ea131ea521311f4d6fb054a146e8282f8e35ff2e6368c1a62e909716",
    screen_name: "screen",
    identifier_name: "identifier"
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe("Valid", () => {
    beforeEach(async () => execSync("npx prisma migrate reset --force"));
    afterEach(async () => execSync("npx prisma migrate reset --force"));

    it("POST /auth/register/draft register draft", async () => {
      return request(app.getHttpServer())
        .post("/auth/register/draft")
        .send(draft)
        .then((res) => expect(res.status).toBe(204));
    });

    it("DELETE /auth/unregister ", async () => {
      const ac = await prisma.account.create({ data: account });
      return request(app.getHttpServer())
        .delete("/auth/unregister")
        .withCredentials()
        .send({
          email: ac.email,
          password: "password",
          identifier_name: ac.identifier_name
        })
        .then((res) => expect(res.status).toBe(204));
    });
  });
});

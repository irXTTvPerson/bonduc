import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { prisma } from "../../../lib/prisma";
import { randomBytes } from "crypto";

@Injectable()
export class DraftAccountService {
  private readonly logger = new Logger("DraftAccountService");

  async hasDraftAccount(address: string, family: string) {
    try {
      const res = await prisma.draftAccount.findUnique({
        where: {
          address: address
        }
      });
      this.logger.log(
        `hasDraftAccount: {address: ${address}, family: ${family}} => ${res ? "exist" : "null"}`
      );
      if (res) {
        return 204;
      } else {
        return 404;
      }
    } catch (e) {
      return 500;
    }
  }

  async registerDraftAccount(address: string, family: string, email: string, password: string) {
    try {
      const token = randomBytes(64).toString("hex");
      await prisma.draftAccount.create({
        data: {
          address: address,
          email: email,
          family: family,
          password: password,
          token: token
        }
      });
      this.logger.log(
        `registerDraftAccount: {address: ${address}, family: ${family}, email: ${email}, password: ${password}} account created`
      );

      return 204;
    } catch (e) {
      this.logger.error(`registerDraftAccount: failed due to ${e}`);
      return 409;
    }
  }
}

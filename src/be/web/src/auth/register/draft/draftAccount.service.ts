import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { prisma } from "../../../lib/prisma";
import { randomUUID, createHash } from "crypto";
import { Config } from "../../../config";
import { EmailService } from "../../../email/email.service";
import { subject, body } from "./registrationMailTemplate";

const hasAlgo = "sha3-512";
const encoding = "hex";

type DraftAccount = {
  address: string;
  family: string;
  email: string;
  password: string;
};

export const isValidPost = (body: any): body is DraftAccount => {
  return "address" in body && "family" in body && "email" in body && "password" in body;
};

@Injectable()
export class DraftAccountService {
  private readonly logger = new Logger("DraftAccountService");

  constructor(private readonly email: EmailService) {}

  async registerDraftAccount(args: DraftAccount) {
    const token = randomUUID();
    const hash = createHash(hasAlgo);
    args.password = hash.update(args.password).digest(encoding);
    try {
      await prisma.draftAccount.create({ data: { ...args, token: token } });
      this.logger.log(`draft account created`, args);
    } catch (e) {
      this.logger.error(`registerDraftAccount: failed due to ${e}`);
      return 409;
    }

    if (Config.isLocalEnv) {
      this.logger.log(`token is ${token}`);
    } else {
      const { error } = await this.email.send(args.email, subject, body(token));
      if (error) {
        this.logger.error(`sending email failed due to ${error}`);
        try {
          await prisma.draftAccount.delete({ where: { ...args } });
        } catch (e) {
          this.logger.error(`failed delete DraftAccount due to ${e}`);
        } finally {
          return 500;
        }
      } else {
        this.logger.log(`email has sent to ${args.email}`);
      }
    }

    return 204;
  }
}

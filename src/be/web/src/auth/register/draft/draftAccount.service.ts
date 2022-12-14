import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { subject, body } from "./registrationMailTemplate";
import { hash } from "../../../lib/hash";
import { sendEmail } from "../../../lib/sendEmail";
import { DBService } from "../../../db/db.service";

type DraftAccount = {
  address: string;
  family: string;
  email: string;
  password: string;
  screen_name: string;
  identifier_name: string;
};

export const isValidPost = (body: any): body is DraftAccount =>
  "address" in body &&
  "family" in body &&
  "email" in body &&
  "password" in body &&
  "screen_name" in body &&
  "identifier_name" in body;

@Injectable()
export class DraftAccountService {
  private readonly logger = new Logger("DraftAccountService");

  constructor(private readonly dbService: DBService) {}

  async register(args: DraftAccount) {
    try {
      const em = await this.dbService.prisma.account.findUnique({
        where: { email: args.email }
      });
      const id = await this.dbService.prisma.account.findUnique({
        where: { identifier_name: args.identifier_name }
      });
      if (em || id) {
        this.logger.warn(
          `registerDraftAccount: already the Account email: ${args.email}, identifier_name: ${args.identifier_name} has taken`
        );
        return 409;
      }
    } catch (e) {
      this.logger.error(`registerDraftAccount: failed due to ${e}`);
      return 500;
    }

    const token = randomUUID();
    args.password = hash(args.password);
    try {
      const ret = await this.dbService.prisma.draftAccount.create({
        data: { ...args, token: token }
      });
      this.logger.log(`draft account created`, ret);
    } catch (e) {
      if (e?.code === "P2002") {
        this.logger.warn(
          `registerDraftAccount: already the DraftAccount identifier_name: ${args.identifier_name} has registered`
        );
        return 409; // failed register due to unique constraint, already the DraftAccount has registered
      } else {
        this.logger.error(`registerDraftAccount: failed due to ${e}`);
        return 500; // idk
      }
    }

    if (process.env.BONDUC_ENV === "local") {
      this.logger.log(`token is ${token}`);
    } else {
      const { error } = await sendEmail(args.email, subject, body(token));
      if (error) {
        this.logger.error(`sending email failed due to ${error}`);
        try {
          await this.dbService.prisma.draftAccount.delete({ where: { ...args } });
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

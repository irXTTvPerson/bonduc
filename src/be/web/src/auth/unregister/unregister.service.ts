import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { prisma } from "../../lib/prisma";
import { createHash } from "crypto";

const hasAlgo = "sha3-512";
const encoding = "hex";

export type DeleteRequest = {
  email: string;
  password: string;
  identifier_name: string;
};

export const isValidPost = (body: any): body is DeleteRequest =>
  "email" in body && "password" in body && "identifier_name" in body;

@Injectable()
export class UnregisterService {
  private readonly logger = new Logger("UnegisterService");

  async Unregister(args: DeleteRequest) {
    const hash = createHash(hasAlgo);
    args.password = hash.update(args.password).digest(encoding);
    try {
      const account = await prisma.account.findUnique({
        where: { identifier_name: args.identifier_name }
      });
      if (!account) {
        this.logger.warn(`Unregister: account ${args.identifier_name} not found`);
        return 404;
      }
      if (account.password !== args.password) {
        this.logger.warn(`invalid password: db, ${account.password} vs input, ${args.password}`);
        return 400;
      }
      await prisma.account.delete({ where: { identifier_name: args.identifier_name } });
    } catch (e) {
      this.logger.error(`Unregister: failed due to ${e}`);
      return 500;
    }
    this.logger.log(`account ${args.identifier_name} successfully deleted.`);
    return 204;
  }
}

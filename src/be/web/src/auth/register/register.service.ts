import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { prisma } from "../../lib/prisma";

@Injectable()
export class RegisterService {
  private readonly logger = new Logger("RegisterService");

  async RegisterAccount(token: string) {
    try {
      const draft = await prisma.draftAccount.findUnique({ where: { token: token } });
      if (!draft) {
        this.logger.warn(`registerAccount: draft account which have token ${token} not found`);
        return 404;
      }
      const res = await prisma.$transaction([
        prisma.draftAccount.delete({ where: { token: token } }),
        prisma.account.create({
          data: {
            email: draft.email,
            password: draft.password,
            ip_address: [draft.address],
            screen_name: draft.screen_name,
            identifier_name: draft.identifier_name
          }
        })
      ]);
      if (!res[0] || !res[1]) {
        this.logger.error(`registerAccount: failed in some reason`);
        return 500;
      }
      this.logger.log(`registerAccount: completed.`);
      return 204;
    } catch (e) {
      this.logger.error(`registerAccount: failed due to ${e}`);
      return 500;
    }
  }
}

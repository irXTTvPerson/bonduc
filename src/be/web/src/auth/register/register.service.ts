import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { DBService } from "../../db/db.service";

@Injectable()
export class RegisterService {
  private readonly logger = new Logger("RegisterService");

  constructor(private readonly dbService: DBService) {}

  async register(token: string) {
    try {
      const draft = await this.dbService.prisma.draftAccount.findUnique({
        where: { token: token }
      });
      if (!draft) {
        this.logger.warn(`registerAccount: draft account which have token ${token} not found`);
        return 404;
      }
      const origin = process.env.CORS_ORIGIN;
      const res = await this.dbService.prisma.$transaction([
        this.dbService.prisma.draftAccount.delete({ where: { token: token } }),
        this.dbService.prisma.account.create({
          data: {
            email: draft.email,
            password: draft.password,
            ip_address: [draft.address],
            screen_name: draft.screen_name,
            identifier_name: draft.identifier_name,
            account_unique_uri: `${origin}/${draft.identifier_name}`,
            inbox: `${origin}/${draft.identifier_name}/inbox`,
            outbox: `${origin}/${draft.identifier_name}/outbox`,
            follower_uri: `${origin}/${draft.identifier_name}/follower`,
            following_uri: `${origin}/${draft.identifier_name}/following`
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

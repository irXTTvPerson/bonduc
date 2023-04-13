import { Logger, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { hash } from "../lib/hash";
import { DBService } from "../db/db.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(private readonly dbService: DBService) {}

  async login(arg: { email: string; password: string }): Promise<string | null> {
    try {
      const account = await this.dbService.prisma.account.findFirst({
        where: {
          AND: {
            email: arg.email,
            password: hash(arg.password)
          }
        }
      });
      if (!account) {
        this.logger.warn(`storeSessionAndAccount: account ${arg.email}, ${arg.password} not found`);
        return null;
      }
      const uuid = randomUUID();
      const val = JSON.stringify(account);
      const expire = 60 * 60 * 24 * 7; // 7 days in [sec]
      await this.dbService.redis.set(`session/${uuid}`, val, { EX: expire });
      // 他人のaccount id でもsessionを辿ってキャッシュを更新できるようにする
      await this.dbService.redis.set(`account/${account.id}`, uuid, { EX: expire });
      return uuid;
    } catch (e) {
      this.logger.error(`storeSessionAndAccount: failed due to ${e}`);
      return null;
    }
  }
}

import { Logger, Injectable } from "@nestjs/common";
import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";
import { hash } from "../lib/hash";
import { client } from "../lib/redis";
import { Config } from "../config";

export type Payload = {
  token: string;
  identifier_name: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  async login(arg: { email: string; password: string }): Promise<string | null> {
    try {
      const account = await prisma.account.findFirst({
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
      const redis = await client();
      const key = randomUUID();
      const val = JSON.stringify(account);
      await redis.set(key, val, { EX: Config.redis.expire });
      await redis.disconnect();
      return key;
    } catch (e) {
      this.logger.error(`storeSessionAndAccount: failed due to ${e}`);
      return null;
    }
  }
}

import { Logger, Injectable } from "@nestjs/common";
import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { hash } from "../lib/hash";
import {client} from "../lib/redis"
import { Config } from "../config";

export type Payload = {
  token: string;
  identifier_name: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  // del --
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<Payload | null> {
    password = hash(password);
    let identifier_name: string;
    this.logger.verbose(`validateUser: email: ${email} password: ${password}`);
    try {
      const account = await prisma.account.findUnique({ where: { email: email } });
      if (!account) {
        this.logger.warn(`validateUser: account ${email} not found`);
        return null;
      }
      if (account.password !== password) {
        this.logger.warn(`validateUser: password incorrect`);
        return null;
      }
      identifier_name = account.identifier_name;
    } catch (e) {
      this.logger.error(`validateUser: failed due to ${e}`);
      return null;
    }
    this.logger.verbose(`validate success`);
    return {
      token: randomUUID(),
      identifier_name: identifier_name
    };
  }

  async login(args: Payload) {
    const ret = {
      access_token: this.jwtService.sign(args)
    };
    this.logger.verbose(`login: `, ret);
    return ret;
  }
  // -- del

  async storeSessionAndAccount(arg: {email: string, password: string}): Promise<string | null> {
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

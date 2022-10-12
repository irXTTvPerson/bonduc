import { Logger, Injectable } from "@nestjs/common";
import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { hash } from "../lib/hash";

export type Payload = {
  token: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<Payload | null> {
    password = hash(password);
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
    } catch (e) {
      this.logger.error(`validateUser: failed due to ${e}`);
      return null;
    }
    this.logger.verbose(`validate success`);
    return {
      token: hash(randomUUID())
    };
  }

  async login(args: Payload) {
    const ret = {
      access_token: this.jwtService.sign(args)
    };
    this.logger.verbose(`login: `, ret);
    return ret;
  }
}

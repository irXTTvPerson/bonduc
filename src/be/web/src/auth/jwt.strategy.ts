import { Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Logger, Injectable } from "@nestjs/common";
import { Config } from "../config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger("JwtStrategy");

  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.signedCookies["session"];
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: Config.jwt.secret
    });
  }

  async validate(payload: any) {
    this.logger.verbose(`validate: `, payload);
    return payload;
  }
}

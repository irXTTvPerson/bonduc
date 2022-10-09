import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Logger, Injectable } from "@nestjs/common";
import { Config } from "../config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger("JwtStrategy");

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Config.jwt.secret
    });
  }

  async validate(payload: any) {
    this.logger.verbose(`validate: `, payload);
    return payload;
  }
}

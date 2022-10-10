import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Logger, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ModuleRef, ContextIdFactory } from "@nestjs/core";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger("LocalStrategy");

  constructor(private moduleRef: ModuleRef) {
    super({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    });
  }

  async validate(req: Request, email: string, password: string) {
    const contextId = ContextIdFactory.getByRequest(req);
    const authService = await this.moduleRef.resolve(AuthService, contextId);
    const id = await authService.validateUser(email, password);
    this.logger.verbose(`validate: `, id);
    if (!id) {
      this.logger.warn(`account who has email: ${email} not found`);
      throw new UnauthorizedException();
    }
    return id;
  }
}

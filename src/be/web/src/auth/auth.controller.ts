import { Controller, Logger, Post, Get, Delete, Req, Res, UseGuards } from "@nestjs/common";
import { DraftAccountService, isValidPost } from "./register/draft/draftAccount.service";
import { RegisterService } from "./register/register.service";
import { Request, Response, CookieOptions } from "express";
import { Config } from "../config";
import { AuthGuard } from "@nestjs/passport";
import {
  UnregisterService,
  isValidPost as UnregisterRequest
} from "./unregister/unregister.service";
import { AuthService, Payload } from "./auth.service";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger("AuthController");

  constructor(
    private readonly draftAccountService: DraftAccountService,
    private readonly registerService: RegisterService,
    private readonly unregisterService: UnregisterService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`[POST] ${req.path} (${req.ip})`);
    const token = await this.authService.login(req.user as Payload);
    const date = new Date();
    date.setDate(date.getDate() + Config.cookie.expireDate);
    res.cookie("session", token.access_token, {
      expires: date,
      ...(Config.cookie.settings as CookieOptions)
    });
    res.status(204).send();
  }

  @Post("register/draft")
  async registerDraftAccount(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`[POST] ${req.path} (${req.ip})`);
    if (!isValidPost(req.body)) {
      this.logger.warn(`[POST] invalid body in ${req.path} (${req.ip})`, req.body);
      res.status(400).send();
      return;
    }
    const status = await this.draftAccountService.register(req.body);
    res.status(status).send();
  }

  @Get("register")
  async registerAccount(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`[GET] ${req.path} (${req.ip})`);
    const { token } = req.query;
    if (!token) {
      this.logger.warn(`[GET] invalid query in ${req.path} (${req.ip})`, req.query);
      res.status(400).send();
      return;
    }
    const status = await this.registerService.register(token as string);
    res.status(status).send();
  }

  @Delete("unregister")
  async unregisterAccount(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`[DELETE] ${req.path} (${req.ip})`);
    if (!UnregisterRequest(req.body)) {
      this.logger.warn(`[DELETE] invalid body in ${req.path} (${req.ip})`, req.body);
      res.status(400).send();
      return;
    }
    const status = await this.unregisterService.unregister(req.body);
    res.status(status).send();
  }
}

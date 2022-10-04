import { Controller, Logger, Header, Post, Options, Req, Res } from "@nestjs/common";
import { DraftAccountService, isValidPost } from "./register/draft/draftAccount.service";
import { Request, Response } from "express";
import { Config } from "../config";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger("AuthController");

  constructor(private readonly draftAccountService: DraftAccountService) {}

  @Options("register/draft")
  @Header("Access-Control-Allow-Origin", Config.feEndpoint)
  @Header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  )
  @Header("Access-Control-Allow-Methods", "DELETE, OPTIONS")
  preflight(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`[OPTIONS] ${req.path} (${req.ip})`);
    res.status(204).send();
  }

  @Post("register/draft")
  @Header("Access-Control-Allow-Origin", Config.feEndpoint)
  async registerDraftAccount(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`[POST] ${req.path} (${req.ip})`);
    if (!isValidPost(req.body)) {
      this.logger.warn(`[POST] invalid body in ${req.path} (${req.ip})`, req.body);
      res.status(400).send();
      return;
    }
    const status = await this.draftAccountService.registerDraftAccount(req.body);
    res.status(status).send();
  }
}

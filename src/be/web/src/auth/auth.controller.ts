import { Controller, Logger, Header, Get, Post, Options, Req, Res } from "@nestjs/common";
import { DraftAccountService } from "./register/draft/draftAccount.service";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger("AuthController");

  constructor(private readonly DraftAccountService: DraftAccountService) {}

  @Options("register/draft")
  @Header("Access-Control-Allow-Origin", process.env.FE_WEB_URL)
  @Header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  )
  @Header("Access-Control-Allow-Methods", "DELETE, OPTIONS")
  preflight(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`[OPTIONS] ${req.path} (${req.ip})`);
    res.status(204).send();
  }

  @Get("register/draft")
  async hasDraftAccount(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { address, family } = req.query;
    this.logger.log(`[GET] ${req.path} [${address}, ${family}] (${req.ip})`);

    if (!address || !family) {
      this.logger.warn(`[GET] query not found on ${req.path} (${req.ip})`);
      res.status(400).send(); // bad request
      return;
    }

    const status = await this.DraftAccountService.hasDraftAccount(
      address as string,
      family as string
    );
    res.status(status).send();
  }

  @Post("register/draft")
  @Header("Access-Control-Allow-Origin", process.env.FE_WEB_URL)
  async registerDraftAccount(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`[POST] ${req.path} (${req.ip})`);
    const {
      address,
      family,
      email,
      password
    }: { address: string; family: string; email: string; password: string } = req.body;

    if (!address || !family || !email || !password) {
      this.logger.warn(`[POST] query not found on ${req.path} (${req.ip})`);
      res.status(400).send(); // bad request
      return;
    }

    const status =
      await this.DraftAccountService.registerDraftAccount(address, family, email, password);
    res.status(status).send();
  }
}

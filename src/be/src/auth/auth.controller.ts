import { Controller, Logger, Post, Get, Delete, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger("AuthController");

  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Req() req, @Res() res) {
    this.logger.log(`[POST] ${req.path} (${req.ip})`);
    const session = await this.authService.login(req.body);
    if (!session) {
      res.status(400).send();
      return;
    }
    const date = new Date();
    date.setDate(date.getDate() + 7);
    res.cookie("session", session, {
      expires: date,
      httpOnly: true,
      secure: true,
      signed: true
    });
    res.status(204).send();
  }
}

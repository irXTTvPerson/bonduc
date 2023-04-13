import { Controller, Logger, Post, Get, Req, Query, Param, Body } from "@nestjs/common";
import { ATLService } from "./atl.service";

@Controller("atl")
export class ATLController {
  private readonly logger = new Logger("ATLController");

  constructor(private readonly atlService: ATLService) { }

  @Get("top")
  async get(@Req() req, @Query("identifier_name") identifier_name: string) {
    this.logger.log(`[GET] ${req.path} (${req.ip})`);
    return await this.atlService.get(req, identifier_name);
  }

}

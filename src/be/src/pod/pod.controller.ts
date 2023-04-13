import { Controller, Logger, Post, Get, Req, Query, Param, Body } from "@nestjs/common";
import { PostPodDto } from "./pod.dto";
import { PodService } from "./pod.service";

@Controller("pod")
export class PodController {
  private readonly logger = new Logger("PodController");

  constructor(private readonly podService: PodService) {}

  @Get("get")
  async get(@Req() req, @Query("id") id: string) {
    this.logger.log(`[GET] ${req.path} (${req.ip})`);
    return await this.podService.get(req, id);
  }

  @Post("post")
  async post(@Req() req, @Body() data: PostPodDto) {
    this.logger.log(`[POST] ${req.path} (${req.ip})`);
    return await this.podService.post(req, data);
  }

  @Get("decrypt")
  async decrypt(@Req() req, @Query("id") id: string, @Query("password") password: string) {
    this.logger.log(`[GET] ${req.path} (${req.ip})`);
    return await this.podService.decrypt(req, id, password);
  }
}

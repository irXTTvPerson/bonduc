import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

@Injectable()
export class DBService implements OnApplicationBootstrap, OnApplicationShutdown {
  private prisma_ = new PrismaClient();
  private prismaPool = [
    new PrismaClient(),
    new PrismaClient(),
    new PrismaClient(),
    new PrismaClient()
  ];
  private redis_ = createClient({
    url: process.env.REDIS_SESSION_URL
  });

  get prisma() {
    return this.prisma_;
  }
  get pool() {
    return this.prismaPool;
  }
  get redis() {
    return this.redis_;
  }

  async onApplicationBootstrap() {
    await this.prisma_.$connect();
    for (const i of this.prismaPool) await i.$connect();
    await this.redis_.connect();
  }

  async onApplicationShutdown() {
    await this.redis_.disconnect();
    for (const i of this.prismaPool) await i.$disconnect();
    await this.prisma_.$disconnect();
  }
}

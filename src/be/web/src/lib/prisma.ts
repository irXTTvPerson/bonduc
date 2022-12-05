import { PrismaClient } from "@prisma/client";
import { Config } from "../config";

export const prisma = new PrismaClient();

export const pool = [];
for (let i = 0; i < Config.prisma.pool; i++) {
  pool.push(new PrismaClient());
}

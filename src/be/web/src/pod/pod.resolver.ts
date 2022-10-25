import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { JwtPayload, GqlAuthGuard } from "../auth/gql.strategy";
import { UseGuards } from "@nestjs/common";
import { Payload } from "../auth/auth.service";

const selectCond = {
  id: true,
  created_at: true,
  to: true,
  cc: true,
  body: true,
  from: {
    select: {
      screen_name: true,
      identifier_name: true
    }
  }
};

@Resolver(Pod)
export class PodResolver {
  @Query(() => Pod, { nullable: true })
  async pod(@Args("id") id: string) {
    return await prisma.pod.findUnique({
      where: { id: id }
    });
  }

  @Query(() => [Pod], { nullable: "itemsAndList" })
  @UseGuards(GqlAuthGuard)
  async pods(
    @Args("to", { type: () => [String], nullable: "itemsAndList" }) to?: string[],
    @Args("cc", { type: () => [String], nullable: "itemsAndList" }) cc?: string[],
    @Args("created_at", { type: () => Date, nullable: true }) created_at?: Date,
    @Args("gt", { nullable: true }) gt?: boolean,
    @Args("lt", { nullable: true }) lt?: boolean
  ) {
    return await prisma.pod.findMany({
      where: {
        OR: {
          to: { array_contains: to },
          cc: { array_contains: cc },
          created_at: gt ? { gt: created_at } : lt ? { lt: created_at } : created_at
        }
      },
      select: selectCond,
      take: Config.limit.pods.find_at_once
    });
  }

  @Mutation(() => Pod, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async createPod(
    @JwtPayload() payload: Payload,
    @Args("body", { type: () => String }) body: string,
    @Args("to", { type: () => [String] }) to: string[],
    @Args("cc", { type: () => [String], nullable: "itemsAndList" }) cc?: string[]
  ) {
    const a = await prisma.account.findUnique({
      where: {
        identifier_name: payload.identifier_name
      },
      select: {
        id: true
      }
    });
    if (!a) {
      return null;
    }
    return await prisma.pod.create({
      data: {
        account_id: a.id,
        to: to,
        cc: cc,
        body: body
      },
      select: selectCond
    });
  }
}

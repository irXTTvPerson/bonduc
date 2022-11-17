import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";

const selectCond = {
  id: true,
  created_at: true,
  to: true,
  cc: true,
  body: true,
  from: true
};

@Resolver(Pod)
export class PodResolver {
  @Query(() => [Pod], { nullable: "itemsAndList" })
  async pods(
    @SessionValidater() account,
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
  async createPod(
    @SessionValidater() account: Account,
    @Args("body", { type: () => String }) body: string,
    @Args("to", { type: () => [String] }) to: string[],
    @Args("cc", { type: () => [String], nullable: "itemsAndList" }) cc?: string[]
  ) {
    return await prisma.pod.create({
      data: {
        account_id: account.id,
        to: to,
        cc: cc,
        body: body
      },
      select: selectCond
    });
  }
}

import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { GqlAuthGuard } from "../auth/gql.strategy";
import { UseGuards } from "@nestjs/common";

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
      take: Config.limit.pods.find_at_once
    });
  }

  @Mutation(() => Pod, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async createPod(
    @Args("from_account_id", { type: () => String }) from_account_id: string,
    @Args("body", { type: () => String }) body: string,
    @Args("to", { type: () => [String] }) to: string[],
    @Args("cc", { type: () => [String], nullable: "itemsAndList" }) cc?: string[]
  ) {
    return await prisma.pod.create({
      data: {
        from_account_id: from_account_id,
        to: to,
        cc: cc,
        body: body
      }
    });
  }
}

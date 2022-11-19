import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { FollowStatus } from "./follow.model";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";
import { Logger } from "@nestjs/common";

@Resolver()
export class FollowResolver {
  private readonly logger = new Logger("FollowResolver");

  @Query(() => FollowStatus)
  async isFollowing(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new FollowStatus();
    const a = await prisma.account.findUnique({
      select: { id: true },
      where: { identifier_name: identifier_name }
    });
    if (!a) {
      this.logger.error(`isFollowing: account ${identifier_name} not found`);
      ret.isFollowing = false;
      return ret;
    }
    const following = await prisma.follow.findFirst({
      where: {
        AND: {
          to_account_id: a.id,
          from_account_id: account.id
        }
      }
    });
    if (following) {
      ret.isFollowing = true;
    } else {
      ret.isFollowing = false;
    }
    return ret;
  }

  @Mutation(() => FollowStatus, { nullable: true })
  async unFollow(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new FollowStatus();
    const a = await prisma.account.findUnique({
      select: { id: true },
      where: { identifier_name: identifier_name }
    });
    if (!a) {
      ret.isFollowing = false;
      this.logger.error(`unFollow: account ${identifier_name} not found`);
      return null;
    }
    const following = await prisma.follow.findFirst({
      where: {
        AND: {
          to_account_id: a.id,
          from_account_id: account.id
        }
      }
    });
    if (!following) {
      this.logger.warn(`unFollow failed: not following ${identifier_name}`);
      return null;
    }
    await prisma.follow.delete({ where: { id: following.id } });
    ret.isFollowing = false;
    return ret;
  }
}

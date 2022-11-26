import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ResultObject } from "../result/result.model";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";
import { Logger } from "@nestjs/common";

@Resolver()
export class FollowResolver {
  private readonly logger = new Logger("FollowResolver");

  @Query(() => ResultObject)
  async isFollowing(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    try {
      const to_account = await prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const following = await prisma.follow.findFirst({
        where: {
          from_account_id: account.id,
          to_account_id: to_account.id
        }
      });
      ret.value = following ? true : false;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }

  @Mutation(() => ResultObject)
  async unFollow(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    try {
      const to_account = await prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const findOrDeleteAcceptRejectCondition = {
        where: {
          from_account_id_to_account_id: {
            from_account_id: to_account.id,
            to_account_id: account.id
          }
        }
      };
      const deleteCondition = {
        where: {
          from_account_id_to_account_id: {
            from_account_id: account.id,
            to_account_id: to_account.id
          }
        }
      };
      const followDeleteCondition = {
        where: {
          from_account_id_to_account_id: {
            from_account_id: account.id,
            to_account_id: to_account.id
          }
        }
      };
      const hasReject = await prisma.rejectFollowRequest.findUnique(
        findOrDeleteAcceptRejectCondition
      );
      const hasAccept = await prisma.acceptFollowRequest.findUnique(
        findOrDeleteAcceptRejectCondition
      );

      if (hasReject && hasAccept) {
        const [r1, r2, r3, r4] = await prisma.$transaction([
          prisma.rejectFollowRequest.delete(findOrDeleteAcceptRejectCondition),
          prisma.acceptFollowRequest.delete(findOrDeleteAcceptRejectCondition),
          prisma.follow.delete(followDeleteCondition),
          prisma.notifyFollowed.delete(deleteCondition)
        ]);
        if (r1 && r2 && r3 && r4) ret.value = true;
        else ret.value = false;
      } else if (hasReject) {
        const [r1, r2, r3] = await prisma.$transaction([
          prisma.rejectFollowRequest.delete(findOrDeleteAcceptRejectCondition),
          prisma.follow.delete(followDeleteCondition),
          prisma.notifyFollowed.delete(deleteCondition)
        ]);
        if (r1 && r2 && r3) ret.value = true;
        else ret.value = false;
      } else if (hasAccept) {
        const [r1, r2, r3] = await prisma.$transaction([
          prisma.acceptFollowRequest.delete(findOrDeleteAcceptRejectCondition),
          prisma.follow.delete(followDeleteCondition),
          prisma.notifyFollowed.delete(deleteCondition)
        ]);
        if (r1 && r2 && r3) ret.value = true;
        else ret.value = false;
      } else {
        const [r1, r2] = await prisma.$transaction([
          prisma.follow.delete(followDeleteCondition),
          prisma.notifyFollowed.delete(deleteCondition)
        ]);
        if (r1 && r2) ret.value = true;
        else ret.value = false;
      }
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }
}

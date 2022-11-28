import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ResultObject } from "../result/result.model";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { redis } from "../lib/redis";

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
        select: { id: true, follower_count: true },
        where: { identifier_name: identifier_name }
      });
      const me = await prisma.account.findUnique({
        select: { following_count: true },
        where: { id: account.id }
      });

      const deleteAcceptRejectCondition = {
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
      const decrementFollowerCondition = {
        where: { id: to_account.id },
        data: { follower_count: to_account.follower_count - 1 }
      };
      const decrementFollowingCondition = {
        where: { id: account.id },
        data: { following_count: me.following_count - 1 }
      };

      const hasReject = (await prisma.rejectFollowRequest.findUnique(deleteAcceptRejectCondition))
        ? true
        : false;
      const hasAccept = (await prisma.acceptFollowRequest.findUnique(deleteAcceptRejectCondition))
        ? true
        : false;
      const hasFollowRequest = (await prisma.followRequest.findUnique(deleteCondition))
        ? true
        : false;

      // キャッシュ上のアカウント情報を更新する
      const session_to = await redis.get(`account/${to_account.id}`);
      const session_me = await redis.get(`account/${account.id}`);

      if (hasFollowRequest && hasReject && hasAccept) {
        const result = await prisma.$transaction([
          prisma.followRequest.delete(deleteCondition),
          prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[5]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[6]));
      } else if (hasFollowRequest && hasReject) {
        const result = await prisma.$transaction([
          prisma.followRequest.delete(deleteCondition),
          prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[4]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[5]));
      } else if (hasFollowRequest && hasAccept) {
        const result = await prisma.$transaction([
          prisma.followRequest.delete(deleteCondition),
          prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[4]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[5]));
      } else if (hasReject && hasAccept) {
        const result = await prisma.$transaction([
          prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[4]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[5]));
      } else if (hasFollowRequest) {
        const result = await prisma.$transaction([
          prisma.followRequest.delete(deleteCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[3]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      } else if (hasReject) {
        const result = await prisma.$transaction([
          prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[3]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      } else if (hasAccept) {
        const result = await prisma.$transaction([
          prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[3]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      } else {
        const result = await prisma.$transaction([
          prisma.follow.delete(deleteCondition),
          prisma.notifyFollowed.delete(deleteCondition),
          prisma.account.update(decrementFollowerCondition),
          prisma.account.update(decrementFollowingCondition)
        ]);
        await redis.set(`session/${session_to}`, JSON.stringify(result[2]));
        await redis.set(`session/${session_me}`, JSON.stringify(result[3]));
      }
      ret.value = true;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }
}

import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ResultObject } from "../result/result.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { DBService } from "../db/db.service";

@Resolver()
export class FollowResolver {
  private readonly logger = new Logger("FollowResolver");

  constructor(private readonly dbService: DBService) {}

  @Query(() => ResultObject)
  async isFollowing(
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const to_account = await this.dbService.prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const following = await this.dbService.prisma.follow.findFirst({
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
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const to_account = await this.dbService.prisma.account.findUnique({
        select: { id: true, follower_count: true },
        where: { identifier_name: identifier_name }
      });
      const me = await this.dbService.prisma.account.findUnique({
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

      const hasReject = (await this.dbService.prisma.rejectFollowRequest.findUnique(
        deleteAcceptRejectCondition
      ))
        ? true
        : false;
      const hasAccept = (await this.dbService.prisma.acceptFollowRequest.findUnique(
        deleteAcceptRejectCondition
      ))
        ? true
        : false;
      const hasFollowRequest = (await this.dbService.prisma.followRequest.findUnique(
        deleteCondition
      ))
        ? true
        : false;

      // キャッシュ上のアカウント情報を更新する
      const session_to = await this.dbService.redis.get(`account/${to_account.id}`);
      const session_me = await this.dbService.redis.get(`account/${account.id}`);

      if (hasFollowRequest && hasReject && hasAccept) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.followRequest.delete(deleteCondition),
          this.dbService.prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[5]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[6]));
      } else if (hasFollowRequest && hasReject) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.followRequest.delete(deleteCondition),
          this.dbService.prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[4]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[5]));
      } else if (hasFollowRequest && hasAccept) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.followRequest.delete(deleteCondition),
          this.dbService.prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[4]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[5]));
      } else if (hasReject && hasAccept) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[4]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[5]));
      } else if (hasFollowRequest) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.followRequest.delete(deleteCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[3]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      } else if (hasReject) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.rejectFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[3]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      } else if (hasAccept) {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.acceptFollowRequest.delete(deleteAcceptRejectCondition),
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[3]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      } else {
        const result = await this.dbService.prisma.$transaction([
          this.dbService.prisma.follow.delete(deleteCondition),
          this.dbService.prisma.notifyFollowed.delete(deleteCondition),
          this.dbService.prisma.account.update(decrementFollowerCondition),
          this.dbService.prisma.account.update(decrementFollowingCondition)
        ]);
        await this.dbService.redis.set(`session/${session_to}`, JSON.stringify(result[2]));
        await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[3]));
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

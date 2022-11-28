import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { Account } from "@prisma/client";
import { ResultObject } from "../result/result.model";
import { redis } from "../lib/redis";

@Resolver()
export class FollowRequestResolver {
  private readonly logger = new Logger("FollowRequestResolver");

  @Query(() => ResultObject)
  async hasFollowRequestSent(
    @SessionValidater() account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    try {
      const to_account = await prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const request = await prisma.followRequest.findFirst({
        where: { to_account_id: to_account.id }
      });
      ret.value = request ? true : false;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }

  @Mutation(() => ResultObject)
  async createFollowRequest(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    try {
      const to_account = await prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const request = await prisma.followRequest.create({
        data: { to_account_id: to_account.id, from_account_id: account.id }
      });
      ret.value = request ? true : false;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }

  @Mutation(() => ResultObject)
  async acceptFollowRequest(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    try {
      const from_account = await prisma.account.findUnique({
        select: { id: true, following_count: true },
        where: { identifier_name: identifier_name }
      });
      const me = await prisma.account.findUnique({
        select: { follower_count: true },
        where: { id: account.id }
      });
      const result = await prisma.$transaction([
        // フォロリク許可を通知
        prisma.acceptFollowRequest.create({
          data: { from_account_id: account.id, to_account_id: from_account.id }
        }),
        // 相手が自分をフォローする
        prisma.follow.create({
          data: { from_account_id: from_account.id, to_account_id: account.id }
        }),
        // 自分宛てにフォローされた通知
        prisma.notifyFollowed.create({
          data: { from_account_id: from_account.id, to_account_id: account.id }
        }),
        // 相手のフォローが増える
        prisma.account.update({
          where: { id: from_account.id },
          data: { following_count: from_account.following_count + 1 }
        }),
        // 自分のフォロワーが増える
        prisma.account.update({
          where: { id: account.id },
          data: { follower_count: me.follower_count + 1 }
        })
      ]);
      // キャッシュ上のアカウント情報を更新する
      const session_from = await redis.get(`account/${from_account.id}`);
      const session_me = await redis.get(`account/${account.id}`);
      await redis.set(`session/${session_from}`, JSON.stringify(result[3]));
      await redis.set(`session/${session_me}`, JSON.stringify(result[4]));
      ret.value = true;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }

  @Mutation(() => ResultObject)
  async rejectFollowRequest(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    try {
      const from_account = await prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });

      const hasReject = await prisma.rejectFollowRequest.findUnique({
        where: {
          from_account_id_to_account_id: {
            from_account_id: account.id,
            to_account_id: from_account.id
          }
        }
      });

      // 以前フォロリク拒否られてたらここでrejectを消さないとDBのunique制約で後続処理が失敗する
      // timestampが更新されるのを期待するためここで一旦deleteして再度createする
      if (hasReject) {
        await prisma.rejectFollowRequest.delete({
          where: {
            from_account_id_to_account_id: {
              from_account_id: account.id,
              to_account_id: from_account.id
            }
          }
        });
      }

      await prisma.$transaction([
        // 自分宛てフォロリクを消す
        prisma.followRequest.delete({
          where: {
            from_account_id_to_account_id: {
              from_account_id: from_account.id,
              to_account_id: account.id
            }
          }
        }),
        // フォロリク拒否を通知
        prisma.rejectFollowRequest.create({
          data: { from_account_id: account.id, to_account_id: from_account.id }
        })
      ]);
      ret.value = true;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }
}

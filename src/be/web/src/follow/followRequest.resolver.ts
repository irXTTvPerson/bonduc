import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { Account } from "@prisma/client";
import { ResultObject } from "../result/result.model";

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
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const [r1, r2, r3, r4] = await prisma.$transaction([
        // 自分宛てフォロリクを消す
        prisma.followRequest.delete({
          where: {
            from_account_id_to_account_id: {
              from_account_id: from_account.id,
              to_account_id: account.id
            }
          }
        }),
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
        })
      ]);
      if (r1 && r2 && r3 && r4) ret.value = true;
      else ret.value = false;
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

      const [r1, r2] = await prisma.$transaction([
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
      if (r1 && r2) ret.value = true;
      else ret.value = false;
    } catch (e) {
      this.logger.error(e);
      ret.value = false;
    } finally {
      return ret;
    }
  }
}

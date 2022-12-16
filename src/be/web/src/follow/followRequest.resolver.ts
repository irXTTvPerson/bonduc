import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";

@Resolver()
export class FollowRequestResolver {
  private readonly logger = new Logger("FollowRequestResolver");

  constructor(private readonly dbService: DBService) {}

  @Query(() => ResultObject)
  async hasFollowRequestSent(
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const to_account = await this.dbService.prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const request = await this.dbService.prisma.followRequest.findFirst({
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
      const request = await this.dbService.prisma.followRequest.create({
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
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const from_account = await this.dbService.prisma.account.findUnique({
        select: { id: true, following_count: true },
        where: { identifier_name: identifier_name }
      });
      const me = await this.dbService.prisma.account.findUnique({
        select: { follower_count: true },
        where: { id: account.id }
      });
      const result = await this.dbService.prisma.$transaction([
        // フォロリク許可を通知
        this.dbService.prisma.acceptFollowRequest.create({
          data: { from_account_id: account.id, to_account_id: from_account.id }
        }),
        // 相手が自分をフォローする
        this.dbService.prisma.follow.create({
          data: { from_account_id: from_account.id, to_account_id: account.id }
        }),
        // 自分宛てにフォローされた通知
        this.dbService.prisma.notifyFollowed.create({
          data: { from_account_id: from_account.id, to_account_id: account.id }
        }),
        // 相手のフォローが増える
        this.dbService.prisma.account.update({
          where: { id: from_account.id },
          data: { following_count: from_account.following_count + 1 }
        }),
        // 自分のフォロワーが増える
        this.dbService.prisma.account.update({
          where: { id: account.id },
          data: { follower_count: me.follower_count + 1 }
        })
      ]);
      // キャッシュ上のアカウント情報を更新する
      const session_from = await this.dbService.redis.get(`account/${from_account.id}`);
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_from}`, JSON.stringify(result[3]));
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[4]));
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
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const ret = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const from_account = await this.dbService.prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });

      const hasReject = await this.dbService.prisma.rejectFollowRequest.findUnique({
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
        await this.dbService.prisma.rejectFollowRequest.delete({
          where: {
            from_account_id_to_account_id: {
              from_account_id: account.id,
              to_account_id: from_account.id
            }
          }
        });
      }

      await this.dbService.prisma.$transaction([
        // 自分宛てフォロリクを消す
        this.dbService.prisma.followRequest.delete({
          where: {
            from_account_id_to_account_id: {
              from_account_id: from_account.id,
              to_account_id: account.id
            }
          }
        }),
        // フォロリク拒否を通知
        this.dbService.prisma.rejectFollowRequest.create({
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

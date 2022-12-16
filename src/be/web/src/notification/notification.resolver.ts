import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { Notification, NotificationType } from "./notification.model";
import { Config } from "../config";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Prisma, PrismaPromise } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";

@Resolver()
export class NotificationResolver {
  private readonly logger = new Logger("NotificationResolver");

  constructor(private readonly dbService: DBService) {}

  @Query(() => [Notification], { nullable: "itemsAndList" })
  async getNotification(@SessionValidater() ctx) {
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const condition = (ct: number) => {
        return {
          where: { to_account_id: account.id, opened: false },
          include: { from: true },
          take: ct,
          orderBy: { created_at: "desc" as Prisma.SortOrder }
        };
      };
      const coundCond = { where: { to_account_id: account.id, opened: false } };

      // 何件ずつデータを取ってくるべきか計算する
      const limit = Config.limit.notification.find_at_once;
      const count = [
        await this.dbService.prisma.followRequest.count(coundCond),
        await this.dbService.prisma.acceptFollowRequest.count(coundCond),
        await this.dbService.prisma.rejectFollowRequest.count(coundCond),
        await this.dbService.prisma.notifyFollowed.count(coundCond)
      ];
      const div = limit / count.length;
      let summation = count.reduce((s, n) => s + n);
      while (summation > limit) {
        for (let i = 0; i < count.length; i++) {
          if (count[i] > div) {
            count[i]--;
          }
        }
        summation = count.reduce((s, n) => s + n);
      }

      if (summation === 0) {
        return [];
      }

      const ret: Notification[] = [];
      const notifications = [
        ["FollowRequest", this.dbService.prisma.followRequest.findMany(condition(count[0]))],
        [
          "AcceptFollowRequest",
          this.dbService.prisma.acceptFollowRequest.findMany(condition(count[1]))
        ],
        [
          "RejectFollowRequest",
          this.dbService.prisma.rejectFollowRequest.findMany(condition(count[2]))
        ],
        ["Followed", this.dbService.prisma.notifyFollowed.findMany(condition(count[3]))]
      ];

      for (const notification of notifications) {
        const type = notification[0] as NotificationType;
        const promise = notification[1] as PrismaPromise<any[]>;
        const result = await promise;

        for (const row of result) {
          ret.push({
            created_at: row.created_at,
            type: type,
            opened: false,
            from: row.from
          });
        }
      }

      ret.sort((a, b) => {
        return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0;
      });
      return ret.slice(0, Config.limit.notification.find_at_once);
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  @Mutation(() => ResultObject)
  async openNotification(
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string,
    @Args("type", { type: () => String }) type: NotificationType
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const from_account = await this.dbService.prisma.account.findUnique({
        select: { id: true },
        where: { identifier_name: identifier_name }
      });
      const updateCondition = {
        where: {
          from_account_id_to_account_id: {
            to_account_id: account.id,
            from_account_id: from_account.id
          }
        },
        data: {
          opened: true
        }
      };

      switch (type) {
        case "FollowRequest":
          await this.dbService.prisma.followRequest.update(updateCondition);
          break;
        case "AcceptFollowRequest":
          await this.dbService.prisma.acceptFollowRequest.update(updateCondition);
          break;
        case "RejectFollowRequest":
          await this.dbService.prisma.rejectFollowRequest.update(updateCondition);
          break;
        case "Followed":
          await this.dbService.prisma.notifyFollowed.update(updateCondition);
          break;
        default:
          break;
      }
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }
}

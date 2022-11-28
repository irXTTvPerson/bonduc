import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { Notification, NotificationType } from "./notification.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Account, Prisma, PrismaPromise } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";

@Resolver()
export class NotificationResolver {
  private readonly logger = new Logger("NotificationResolver");

  @Query(() => [Notification], { nullable: "itemsAndList" })
  async getNotification(@SessionValidater() account: Account) {
    try {
      const condition = {
        where: { to_account_id: account.id, opened: false },
        include: { from: true },
        take: Config.limit.notification.find_at_once,
        orderBy: { created_at: "desc" as Prisma.SortOrder }
      };

      const ret: Notification[] = [];
      const notifications = [
        ["FollowRequest", prisma.followRequest.findMany(condition)],
        ["AcceptFollowRequest", prisma.acceptFollowRequest.findMany(condition)],
        ["RejectFollowRequest", prisma.rejectFollowRequest.findMany(condition)],
        ["Followed", prisma.notifyFollowed.findMany(condition)]
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
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string,
    @Args("type", { type: () => String }) type: NotificationType
  ) {
    const res = new ResultObject();
    try {
      const from_account = await prisma.account.findUnique({
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
          await prisma.followRequest.update(updateCondition);
          break;
        case "AcceptFollowRequest":
          await prisma.acceptFollowRequest.update(updateCondition);
          break;
        case "RejectFollowRequest":
          await prisma.rejectFollowRequest.update(updateCondition);
          break;
        case "Followed":
          await prisma.notifyFollowed.update(updateCondition);
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

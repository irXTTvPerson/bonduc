import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { Notification } from "./notification.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { NotificationType } from "@prisma/client";
import { Logger } from "@nestjs/common";

@Resolver()
export class FollowRequestResolver {
  private readonly logger = new Logger("FollowRequestResolver");

  @Query(() => [Notification], { nullable: "itemsAndList" })
  async getFollowRequest(
    @SessionValidater() account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    const type: NotificationType = "follow_request";
    if (account.identifier_name === target_identifier_name) {
      this.logger.error("notification cannot create same 'from' and 'to'");
      return null;
    }
    const a = await prisma.account.findUnique({
      select: {
        id: true
      },
      where: { identifier_name: target_identifier_name }
    });
    if (!a) {
      this.logger.error(`getFollowRequest: account ${target_identifier_name} not found`);
      return null;
    }
    return await prisma.notification.findMany({
      where: {
        from_account_id: account.id,
        type: type,
        to_account_id: a.id
      },
      take: Config.limit.notification.find_at_once,
      orderBy: {
        created_at: "desc"
      }
    });
  }

  @Mutation(() => Notification, { nullable: true })
  async createFollowRequest(
    @SessionValidater() account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    const type: NotificationType = "follow_request";
    if (account.identifier_name === target_identifier_name) {
      this.logger.error("follow request cannot create same 'from' and 'to'");
      return null;
    }
    const a = await prisma.account.findUnique({
      select: {
        id: true
      },
      where: { identifier_name: target_identifier_name }
    });
    if (!a) {
      this.logger.error(`createFollowRequest: account ${target_identifier_name} not found`);
      return null;
    }
    const n = await prisma.notification.findFirst({
      where: {
        AND: {
          from_account_id: account.id,
          to_account_id: a.id,
          type: type
        }
      }
    });
    if (n) {
      this.logger.error(`createFollowRequest: already follow request exist`);
      return null;
    }
    return await prisma.notification.create({
      data: {
        from_account_id: account.id,
        to_account_id: a.id,
        type: type,
        opened: false
      }
    });
  }
}

import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { Notification } from "./notification.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { NotificationType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { Account } from "@prisma/client";

@Resolver()
export class FollowRequestResolver {
  private readonly logger = new Logger("FollowRequestResolver");

  @Query(() => Notification, { nullable: true })
  async getFollowRequest(
    @SessionValidater() account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    const type: NotificationType = "follow_request";
    if (account.identifier_name === target_identifier_name) {
      // [fe]: accountページで自分自身に対してgetFollowRequestする場合がある
      this.logger.warn("get follow request cannot set same 'from' and 'to'");
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
    return await prisma.notification.findFirst({
      where: {
        from_account_id: account.id,
        type: type,
        to_account_id: a.id
      }
    });
  }

  @Mutation(() => Notification, { nullable: true })
  async createFollowRequest(
    @SessionValidater() account: Account,
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

  async acceptOrReject(account: Account, target_identifier_name: string, type: NotificationType) {
    if (account.identifier_name === target_identifier_name) {
      this.logger.error("accept or reject follow request cannot create same 'from' and 'to'");
      return null;
    }
    const a = await prisma.account.findUnique({
      select: {
        id: true
      },
      where: { identifier_name: target_identifier_name }
    });
    if (!a) {
      this.logger.error(`acceptOrRejectFollowRequest: account ${target_identifier_name} not found`);
      return null;
    }
    const n = await prisma.notification.findFirst({
      where: {
        AND: {
          from_account_id: a.id,
          to_account_id: account.id, // 自分宛てのフォロリクがあるはず
          type: "follow_request"
        }
      }
    });
    if (!n) {
      this.logger.error(`acceptOrRejectFollowRequest: follow request not found`);
      return null;
    }
    const accept = await prisma.notification.findFirst({
      where: {
        AND: {
          from_account_id: account.id,
          to_account_id: a.id,
          type: "follow_request_accepted"
        }
      }
    });
    const reject = await prisma.notification.findFirst({
      where: {
        AND: {
          from_account_id: account.id,
          to_account_id: a.id,
          type: "follow_request_rejected"
        }
      }
    });
    if (accept || reject) {
      this.logger.error(
        `acceptOrRejectFollowRequest: accept or reject follow request already exist`
      );
      return null;
    }
    await prisma.notification.update({
      where: {
        id: n.id
      },
      data: {deactivated: true}
    });
    return await prisma.notification.create({
      data: {
        from_account_id: account.id,
        to_account_id: a.id,
        type: type,
        opened: false
      }
    });
  }

  @Mutation(() => Notification, { nullable: true })
  async acceptFollowRequest(
    @SessionValidater() account: Account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    return await this.acceptOrReject(account, target_identifier_name, "follow_request_accepted");
  }

  @Mutation(() => Notification, { nullable: true })
  async rejectFollowRequest(
    @SessionValidater() account: Account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    return await this.acceptOrReject(account, target_identifier_name, "follow_request_rejected");
  }
}

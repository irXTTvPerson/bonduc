import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { FollowRequest } from "./followRequest.model";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { NotificationType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { Account } from "@prisma/client";

@Resolver()
export class FollowRequestResolver {
  private readonly logger = new Logger("FollowRequestResolver");

  @Query(() => FollowRequest, { nullable: true })
  async hasFollowRequestSent(
    @SessionValidater() account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    try {
      const type: NotificationType = "follow_requested";
      if (account.identifier_name === identifier_name) {
        // [fe]: accountページで自分自身に対してgetFollowRequestする場合がある
        this.logger.warn("get follow request cannot set same 'from' and 'to'");
        return null;
      }
      const a = await prisma.account.findUnique({
        select: {
          id: true
        },
        where: { identifier_name: identifier_name }
      });
      if (!a) {
        this.logger.error(`getFollowRequest: account ${identifier_name} not found`);
        return null;
      }
      const ret = await prisma.notification.findFirst({
        where: {
          from_account_id: account.id,
          type: type,
          to_account_id: a.id
        }
      });
      const f = new FollowRequest();
      if (ret) {
        f.status = "requested";
      } else {
        f.status = "none";
      }
      return f;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  @Mutation(() => FollowRequest, { nullable: true })
  async createFollowRequest(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    try {
      const type: NotificationType = "follow_requested";
      if (account.identifier_name === identifier_name) {
        this.logger.error("follow request cannot create same 'from' and 'to'");
        return null;
      }
      const a = await prisma.account.findUnique({
        select: {
          id: true
        },
        where: { identifier_name: identifier_name }
      });
      if (!a) {
        this.logger.error(`createFollowRequest: account ${identifier_name} not found`);
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
      const followed = await prisma.follow.findFirst({
        where: {
          AND: {
            from_account_id: account.id,
            to_account_id: a.id
          }
        }
      });
      if (followed) {
        this.logger.error(`createFollowRequest: already followed`);
        return null;
      }
      await prisma.notification.create({
        data: {
          from_account_id: account.id,
          to_account_id: a.id,
          type: type,
          opened: false
        }
      });
      const f = new FollowRequest();
      f.status = "requested";
      return f;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  async acceptOrReject(account: Account, identifier_name: string, type: NotificationType) {
    if (account.identifier_name === identifier_name) {
      this.logger.error("accept or reject follow request cannot create same 'from' and 'to'");
      return null;
    }
    const a = await prisma.account.findUnique({
      select: {
        id: true
      },
      where: { identifier_name: identifier_name }
    });
    if (!a) {
      this.logger.error(`acceptOrRejectFollowRequest: account ${identifier_name} not found`);
      return null;
    }
    const n = await prisma.notification.findFirst({
      where: {
        AND: {
          from_account_id: a.id,
          to_account_id: account.id, // 自分宛てのフォロリクがあるはず
          type: "follow_requested"
        }
      }
    });
    if (!n) {
      this.logger.error(`acceptOrRejectFollowRequest: follow request not found`);
      return null;
    }
    const f = new FollowRequest();
    if (type === "follow_request_accepted") {
      await prisma.$transaction([
        prisma.notification.create({
          data: {
            from_account_id: account.id,
            to_account_id: a.id,
            type: type,
            opened: false
          }
        }),
        // acceptでもrejectでもフォロリクは消す
        prisma.notification.delete({
          where: { id: n.id }
        }),
        // followされる
        prisma.follow.create({
          data: {
            from_account_id: a.id,
            to_account_id: account.id
          }
        }),
        // フォロリク通したらフォローされた通知する
        prisma.notification.create({
          data: {
            from_account_id: a.id,
            to_account_id: account.id,
            type: "followed",
            opened: false
          }
        })
      ]);
      f.status = "accepted";
      return f;
    }
    if (type === "follow_request_rejected") {
      await prisma.$transaction([
        prisma.notification.create({
          data: {
            from_account_id: account.id,
            to_account_id: a.id,
            type: type,
            opened: false
          }
        }),
        // acceptでもrejectでもフォロリクは消す
        prisma.notification.delete({
          where: { id: n.id }
        })
      ]);
      f.status = "rejected";
      return f;
    }
    return null;
  }

  @Mutation(() => FollowRequest, { nullable: true })
  async acceptFollowRequest(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    try {
      return await this.acceptOrReject(account, identifier_name, "follow_request_accepted");
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  @Mutation(() => FollowRequest, { nullable: true })
  async rejectFollowRequest(
    @SessionValidater() account: Account,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    try {
      return await this.acceptOrReject(account, identifier_name, "follow_request_rejected");
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}

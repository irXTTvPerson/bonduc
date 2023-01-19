import { Resolver, Args, Mutation, Query } from "@nestjs/graphql";
import { ReplyPod } from "./pod.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import {
  PodVisibility,
  TimelineType,
  Pod,
  QpPod,
  ReplyPod as PrismaReplyPod,
  Account,
  ReplyToType
} from "@prisma/client";
import { Logger } from "@nestjs/common";
import { DBService } from "../db/db.service";
import { convertVisibilityCc, convertVisibilityTo } from "./address.converter";
import { Config } from "../config";

@Resolver()
export class ReplyResolver {
  private readonly logger = new Logger("ReplyResolver");

  constructor(private readonly dbService: DBService) {}

  @Mutation(() => ReplyPod, { nullable: true })
  async createReplyPod(
    @SessionValidater() ctx,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("timeline_type", { type: () => TimelineType }) timeline_type: TimelineType,
    @Args("reply_to_id", { type: () => String }) reply_to_id: string,
    @Args("reply_to_type", { type: () => ReplyToType }) reply_to_type: ReplyToType
  ) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      let account = await this.dbService.pool[0].account.findUnique({
        where: { id: me.id }
      });

      let pod:
        | (Pod & { from: Account })
        | (QpPod & { from: Account })
        | (PrismaReplyPod & { from: Account });
      let prisma: any;
      switch (reply_to_type) {
        case "pod":
          pod = await this.dbService.prisma.pod.findFirst({
            where: { id: reply_to_id },
            include: { from: true }
          });
          prisma = this.dbService.prisma.pod;
          break;
        case "qp":
          pod = await this.dbService.prisma.qpPod.findFirst({
            where: { id: reply_to_id },
            include: { from: true }
          });
          prisma = this.dbService.prisma.qpPod;
          break;
        case "reply":
          pod = await this.dbService.prisma.replyPod.findFirst({
            where: { id: reply_to_id },
            include: { from: true }
          });
          prisma = this.dbService.prisma.replyPod;
          break;
        default:
          throw new Error("invliad pod type");
          break;
      }

      const [replyPod, resultAccount] = await this.dbService.prisma.$transaction([
        this.dbService.prisma.replyPod.create({
          data: {
            account_id: me.id,
            to: convertVisibilityTo(visibility, me),
            cc: convertVisibilityCc(visibility, me),
            body: body,
            visibility: visibility,
            timeline_type: timeline_type,
            reply_to_id: reply_to_id,
            reply_to_type: reply_to_type
          },
          include: { from: true }
        }),
        this.dbService.prisma.account.update({
          where: { id: me.id },
          data: { pod_count: account.pod_count + 1, last_pod_at: new Date() }
        }),
        this.dbService.prisma.notifyReplyed.create({
          data: {
            from_account_id: me.id,
            to_account_id: pod.from.id
          }
        }),
        prisma.update({ where: { id: pod.id }, data: { reply_count: pod.reply_count + 1 } })
      ]);

      const session_me = await this.dbService.redis.get(`account/${me.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(resultAccount));
      replyPod["favorited"] = false;
      replyPod["mypod"] = true;
      return replyPod;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  @Query(() => [ReplyPod], { nullable: true })
  async getReplyPodViaReplyToId(
    @SessionValidater() ctx,
    @Args("reply_to_id", { type: () => String }) reply_to_id: string
  ) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const ret = await this.dbService.prisma.replyPod.findMany({
        where: { reply_to_id: reply_to_id },
        include: { from: true },
        take: Config.limit.pods.find_at_once
      });
      return await Promise.all(
        ret.map(async (e) => {
          const fav = await this.dbService.prisma.favorite.findUnique({
            where: {
              content_id_account_id: {
                content_id: e.id,
                account_id: me.id
              }
            }
          });
          e["favorited"] = fav ? true : false;
          e["mypod"] = e.account_id === me.id;
          return e;
        })
      );
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  @Query(() => ReplyPod, { nullable: true })
  async getReplyPod(@SessionValidater() ctx, @Args("id", { type: () => String }) id: string) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const pod = await this.dbService.pool[0].replyPod.findUnique({
        where: { id: id },
        include: { from: true }
      });
      const fav = await this.dbService.prisma.favorite.findUnique({
        where: { content_id_account_id: { account_id: me.id, content_id: pod.id } }
      });
      pod["favorited"] = fav ? true : false;
      pod["mypod"] = pod.account_id === me.id;
      return pod;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }
}

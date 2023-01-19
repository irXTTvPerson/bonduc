import { Resolver, Args, Mutation, Query } from "@nestjs/graphql";
import { DpPod } from "./pod.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Account, PodVisibility, DpContentType, TimelineType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { DBService } from "../db/db.service";
import { convertVisibilityCc, convertVisibilityTo } from "./address.converter";

@Resolver()
export class DpResolver {
  private readonly logger = new Logger("DpResolver");

  constructor(private readonly dbService: DBService) {}

  private async createDpPodImpl(
    account: Account,
    content_id: string,
    visibility: PodVisibility,
    content_type: DpContentType,
    timeline_type: TimelineType
  ) {
    const pool: any =
      content_type === "pod"
        ? this.dbService.pool[0].pod
        : content_type === "qp"
        ? this.dbService.pool[0].qpPod
        : this.dbService.pool[0].replyPod;

    const prisma: any =
      content_type === "pod"
        ? this.dbService.prisma.pod
        : content_type === "qp"
        ? this.dbService.prisma.qpPod
        : this.dbService.prisma.replyPod;

    const [pod, count, fav] = await Promise.all([
      pool.findUnique({
        where: { id: content_id },
        include: { from: true }
      }),
      this.dbService.pool[1].account.findUnique({
        where: { id: account.id },
        select: { pod_count: true }
      }),
      this.dbService.pool[2].favorite.findUnique({
        where: {
          content_id_account_id: {
            content_id: content_id,
            account_id: account.id
          }
        }
      })
    ]);
    const result = await this.dbService.prisma.$transaction([
      this.dbService.prisma.dpPod.create({
        data: {
          account_id: account.id,
          to: convertVisibilityTo(visibility, account),
          cc: convertVisibilityCc(visibility, account),
          content_id: content_id,
          content_type: content_type as DpContentType,
          visibility: visibility,
          timeline_type: timeline_type
        },
        include: { from: true }
      }),
      this.dbService.prisma.account.update({
        where: { id: account.id },
        data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
      }),
      prisma.update({
        where: { id: content_id },
        data: { rp_count: pod.rp_count + 1 }
      })
    ]);
    if (content_type === "pod") {
      result[0]["pod"] = pod;
      result[0]["pod"]["mypod"] = pod.from.id === account.id;
      result[0]["pod"]["favorited"] = fav ? true : false;
      result[0]["pod"]["encrypted"] = pod.password === null ? false : true;
    } else if (content_type === "qp") {
      result[0]["qp"] = pod;
      result[0]["qp"]["mypod"] = pod.from.id === account.id;
      result[0]["qp"]["favorited"] = fav ? true : false;
    } else {
      result[0]["reply"] = pod;
      result[0]["reply"]["mypod"] = pod.from.id === account.id;
      result[0]["reply"]["favorited"] = fav ? true : false;
    }
    return { account: result[1], dpPod: result[0] };
  }

  @Mutation(() => DpPod, { nullable: true })
  async createDpPod(
    @SessionValidater() ctx,
    @Args("content_id", { type: () => String }) content_id: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("content_type", { type: () => String }) content_type: DpContentType,
    @Args("timeline_type", { type: () => TimelineType }) timeline_type: TimelineType
  ) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const { dpPod, account } = await this.createDpPodImpl(
        me,
        content_id,
        visibility,
        content_type,
        timeline_type
      );
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(account));
      return dpPod;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  @Query(() => DpPod, { nullable: true })
  async getDpPod(@SessionValidater() ctx, @Args("id", { type: () => String }) id: string) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const dp = await this.dbService.pool[0].dpPod.findUnique({
        where: { id: id },
        include: { from: true }
      });

      const content_id = dp.content_id;

      const prisma: any =
        dp.content_type === "pod"
          ? this.dbService.prisma.pod
          : dp.content_type === "qp"
          ? this.dbService.prisma.qpPod
          : this.dbService.prisma.replyPod;

      const [pod, content_fav] = await Promise.all([
        prisma.findUnique({
          where: { id: content_id },
          include: { from: true }
        }),
        this.dbService.pool[0].favorite.findUnique({
          where: {
            content_id_account_id: {
              content_id: content_id,
              account_id: me.id
            }
          }
        })
      ]);

      if (dp.content_type === "pod") {
        dp["pod"] = pod;
        dp["pod"]["mypod"] = pod.from.id === me.id;
        dp["pod"]["favorited"] = content_fav ? true : false;
        dp["pod"]["encrypted"] = pod.password === null ? false : true;
      } else if (dp.content_type === "qp") {
        dp["qp"] = pod;
        dp["qp"]["mypod"] = pod.from.id === me.id;
        dp["qp"]["favorited"] = content_fav ? true : false;
      } else {
        dp["reply"] = pod;
        dp["reply"]["mypod"] = pod.from.id === me.id;
        dp["reply"]["favorited"] = content_fav ? true : false;
      }
      return dp;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }
}

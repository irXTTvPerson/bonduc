import { Resolver, Args, Mutation } from "@nestjs/graphql";
import { QpPod } from "./pod.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Account, PodVisibility, QpContentType, TimelineType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { DBService } from "../db/db.service";
import { convertVisibilityCc, convertVisibilityTo } from "./address.converter";

@Resolver()
export class QpResolver {
  private readonly logger = new Logger("QpResolver");

  constructor(private readonly dbService: DBService) {}

  private async createQpPodImpl(
    account: Account,
    body: string,
    content_id: string,
    visibility: PodVisibility,
    content_type: QpContentType,
    timeline_type: TimelineType
  ) {
    const pool: any =
      content_type === "pod" ? this.dbService.pool[0].pod : this.dbService.pool[0].qpPod;
    const prisma: any =
      content_type === "pod" ? this.dbService.prisma.pod : this.dbService.prisma.qpPod;
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
      this.dbService.prisma.qpPod.create({
        data: {
          account_id: account.id,
          to: convertVisibilityTo(visibility, account),
          cc: convertVisibilityCc(visibility, account),
          content_id: content_id,
          content_type: content_type as QpContentType,
          visibility: visibility,
          body: body,
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
    result[0]["mypod"] = true;
    result[0]["favorited"] = false;
    if (content_type === "pod") {
      result[0]["pod"] = pod;
      result[0]["pod"]["mypod"] = pod.from.id === account.id;
      result[0]["pod"]["favorited"] = fav ? true : false;
      result[0]["pod"]["encrypted"] = pod.password === null ? false : true;
    } else {
      result[0]["qp"] = pod;
      result[0]["qp"]["mypod"] = pod.from.id === account.id;
      result[0]["qp"]["favorited"] = fav ? true : false;
    }
    return { account: result[1], qpPod: result[0] };
  }

  @Mutation(() => QpPod, { nullable: true })
  async createQpPod(
    @SessionValidater() ctx,
    @Args("content_id", { type: () => String }) content_id: string,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("content_type", { type: () => String }) content_type: QpContentType,
    @Args("timeline_type", { type: () => TimelineType }) timeline_type: TimelineType
  ) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const { qpPod, account } = await this.createQpPodImpl(
        me,
        body,
        content_id,
        visibility,
        content_type,
        timeline_type
      );
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(account));
      return qpPod;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }
}

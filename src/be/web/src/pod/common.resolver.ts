import { Resolver, Args, Query } from "@nestjs/graphql";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { DBService } from "../db/db.service";
import { PodResolver } from "./pod.resolver";
import { DpResolver } from "./dp.resolver";
import { QpResolver } from "./qp.resolver";
import { ReplyResolver } from "./reply.resolver";
import { HomeTimeline } from "../timeline/htl.model";

@Resolver()
export class PodCommonResolver {
  private readonly logger = new Logger("PodCommonResolver");

  constructor(
    private readonly dbService: DBService,
    private readonly podResolver: PodResolver,
    private readonly dpResolver: DpResolver,
    private readonly qpResolver: QpResolver,
    private readonly replyResolver: ReplyResolver
  ) {}

  @Query(() => HomeTimeline, { nullable: true })
  async findPod(@SessionValidater() ctx, @Args("id", { type: () => String }) id: string) {
    await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const [pod, dp, qp, reply] = await Promise.all([
        this.dbService.pool[0].pod.findUnique({ where: { id: id }, select: { id: true } }),
        this.dbService.pool[1].dpPod.findUnique({ where: { id: id }, select: { id: true } }),
        this.dbService.pool[2].qpPod.findUnique({ where: { id: id }, select: { id: true } }),
        this.dbService.pool[3].replyPod.findUnique({ where: { id: id }, select: { id: true } })
      ]);
      if (pod)
        return {
          pod: this.podResolver.getPod(ctx, id)
        };
      if (dp)
        return {
          dp: this.dpResolver.getDpPod(ctx, id)
        };
      if (qp)
        return {
          qp: this.qpResolver.getQpPod(ctx, id)
        };
      if (reply)
        return {
          reply: this.replyResolver.getReplyPod(ctx, id)
        };
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }
}

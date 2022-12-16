import { Resolver, Args, Mutation } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Account, PodVisibility, DpContentType, QpContentType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";
import { Type } from "../timeline/htl.model";

@Resolver(Pod)
export class PodResolver {
  private readonly logger = new Logger("PodResolver");

  constructor(private readonly dbService: DBService) {}

  private convertVisibilityTo(visibility: PodVisibility, account: Account) {
    let to = [];
    switch (visibility) {
      default:
      case "login":
      case "password": // パスワードつきpodはbonduc固有機能なので連合できない
      case "local":
        to = ["https://www.w3.org/ns/activitystreams#Local"];
        break;
      case "anyone":
      case "global":
        to = ["https://www.w3.org/ns/activitystreams#Public"];
        break;
      case "myself":
        to = [account.account_unique_uri];
        break;
      case "following":
        to = [account.following_uri];
        break;
      case "follower":
        to = [account.follower_uri];
        break;
      case "mutual":
        // TODO
        // to = [...mutual_accounts_uri];
        break;
      case "list":
        // TODO
        // to = [...listed_accounts_uri];
        break;
      case "mention":
        // TODO
        // to = [...mentioned_accounts_uri];
        break;
    }
    return to;
  }

  private convertVisibilityCc(visibility: PodVisibility, account: Account) {
    let cc = [];
    switch (visibility) {
      case "login":
      case "password":
      case "local":
      case "anyone":
      case "global":
      case "mention":
        cc = [account.follower_uri];
        break;
      default:
        break;
    }
    return cc;
  }

  @Mutation(() => ResultObject)
  async createPod(
    @SessionValidater() ctx,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const count = await this.dbService.prisma.account.findUnique({
        where: { id: account.id },
        select: { pod_count: true }
      });
      const result = await this.dbService.prisma.$transaction([
        this.dbService.prisma.pod.create({
          data: {
            account_id: account.id,
            to: this.convertVisibilityTo(visibility, account),
            cc: this.convertVisibilityCc(visibility, account),
            body: body,
            visibility: visibility
          }
        }),
        this.dbService.prisma.account.update({
          where: { id: account.id },
          data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
        })
      ]);
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result[1]));
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }

  private async createDpPodImpl(
    account: Account,
    rp_id: string,
    visibility: PodVisibility,
    type: Type
  ) {
    const pool: any = type === "pod" ? this.dbService.pool[0].pod : this.dbService.pool[0].qpPod;
    const prisma: any = type === "pod" ? this.dbService.prisma.pod : this.dbService.prisma.qpPod;
    const [pod, count] = await Promise.all([
      pool.findUnique({
        where: { id: rp_id },
        select: { rp_count: true }
      }),
      this.dbService.pool[1].account.findUnique({
        where: { id: account.id },
        select: { pod_count: true }
      })
    ]);
    const result = await this.dbService.prisma.$transaction([
      this.dbService.prisma.dpPod.create({
        data: {
          account_id: account.id,
          to: this.convertVisibilityTo(visibility, account),
          cc: this.convertVisibilityCc(visibility, account),
          rp_id: rp_id,
          rp_type: type as DpContentType,
          visibility: visibility
        }
      }),
      this.dbService.prisma.account.update({
        where: { id: account.id },
        data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
      }),
      prisma.update({
        where: { id: rp_id },
        data: { rp_count: pod.rp_count + 1 }
      })
    ]);
    return result[1];
  }

  private async createQpPodImpl(
    account: Account,
    body: string,
    rp_id: string,
    visibility: PodVisibility,
    type: Type
  ) {
    const pool: any = type === "pod" ? this.dbService.pool[0].pod : this.dbService.pool[0].qpPod;
    const prisma: any = type === "pod" ? this.dbService.prisma.pod : this.dbService.prisma.qpPod;
    const [pod, count] = await Promise.all([
      pool.findUnique({
        where: { id: rp_id },
        select: { rp_count: true }
      }),
      this.dbService.pool[1].account.findUnique({
        where: { id: account.id },
        select: { pod_count: true }
      })
    ]);
    const result = await this.dbService.prisma.$transaction([
      this.dbService.prisma.qpPod.create({
        data: {
          account_id: account.id,
          to: this.convertVisibilityTo(visibility, account),
          cc: this.convertVisibilityCc(visibility, account),
          rp_id: rp_id,
          rp_type: type as QpContentType,
          visibility: visibility,
          body: body
        }
      }),
      this.dbService.prisma.account.update({
        where: { id: account.id },
        data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
      }),
      prisma.update({
        where: { id: rp_id },
        data: { rp_count: pod.rp_count + 1 }
      })
    ]);
    return result[1];
  }

  @Mutation(() => ResultObject)
  async createDpPod(
    @SessionValidater() ctx,
    @Args("rp_id", { type: () => String }) rp_id: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("type", { type: () => String }) type: Type
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const updatedAccount = await this.createDpPodImpl(account, rp_id, visibility, type);
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(updatedAccount));
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }

  @Mutation(() => ResultObject)
  async createQpPod(
    @SessionValidater() ctx,
    @Args("rp_id", { type: () => String }) rp_id: string,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("type", { type: () => String }) type: Type
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const updatedAccount = await this.createQpPodImpl(account, body, rp_id, visibility, type);
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(updatedAccount));
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }
}

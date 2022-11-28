import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Account, PodVisibility } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { redis } from "../lib/redis";

@Resolver(Pod)
export class PodResolver {
  private readonly logger = new Logger("PodResolver");

  convertVisibilityTo(visibility: PodVisibility, account: Account) {
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

  convertVisibilityCc(visibility: PodVisibility, account: Account) {
    let cc = null;
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

  @Query(() => [Pod], { nullable: "itemsAndList" })
  async pods(
    @SessionValidater() account,
    @Args("to", { type: () => [String], nullable: "itemsAndList" }) to?: string[],
    @Args("cc", { type: () => [String], nullable: "itemsAndList" }) cc?: string[],
    @Args("created_at", { type: () => Date, nullable: true }) created_at?: Date,
    @Args("gt", { nullable: true }) gt?: boolean,
    @Args("lt", { nullable: true }) lt?: boolean
  ) {
    try {
      const pods = await prisma.pod.findMany({
        where: {
          OR: {
            to: { array_contains: to },
            cc: { array_contains: cc },
            created_at: gt ? { gt: created_at } : lt ? { lt: created_at } : created_at
          }
        },
        include: { from: true },
        take: Config.limit.pods.find_at_once,
        orderBy: { created_at: "desc" }
      });
      for (const pod of pods) {
        const fav = await prisma.favorite.findFirst({
          where: {
            AND: {
              account_id: account.id,
              pod_id: pod.id
            }
          }
        });
        // podに存在しないプロパティを強引に追加する
        pod["favorited"] = fav ? true : false;
      }
      return pods;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  @Mutation(() => ResultObject)
  async createPod(
    @SessionValidater() account: Account,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility
  ) {
    const res = new ResultObject();
    try {
      const count = await prisma.account.findUnique({
        where: { id: account.id },
        select: { pod_count: true }
      });
      const result = await prisma.$transaction([
        prisma.pod.create({
          data: {
            account_id: account.id,
            to: this.convertVisibilityTo(visibility, account),
            cc: this.convertVisibilityCc(visibility, account),
            body: body,
            visibility: visibility
          }
        }),
        prisma.account.update({
          where: { id: account.id },
          data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
        })
      ]);
      const session_me = await redis.get(`account/${account.id}`);
      await redis.set(`session/${session_me}`, JSON.stringify(result[1]));
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }

  @Mutation(() => ResultObject)
  async createDpPod(
    @SessionValidater() account: Account,
    @Args("pod_id", { type: () => String }) pod_id: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility
  ) {
    const res = new ResultObject();
    try {
      const pod = await prisma.pod.findUnique({ where: { id: pod_id } });
      if (!pod) {
        this.logger.error(`createDpPod: pod not found`);
        res.value = false;
        return res;
      }
      const count = await prisma.account.findUnique({
        where: { id: account.id },
        select: { pod_count: true }
      });
      const result = await prisma.$transaction([
        prisma.dpPod.create({
          data: {
            account_id: account.id,
            to: this.convertVisibilityTo(visibility, account),
            cc: this.convertVisibilityCc(visibility, account),
            pod_id: pod_id,
            visibility: visibility
          }
        }),
        prisma.account.update({
          where: { id: account.id },
          data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
        })
      ]);
      const session_me = await redis.get(`account/${account.id}`);
      await redis.set(`session/${session_me}`, JSON.stringify(result[1]));
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }
}

import { Resolver, Args, Mutation, Query } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Account, PodVisibility, DpContentType, QpContentType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";
import { Type } from "../timeline/htl.model";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { hash } from "../lib/hash";

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

  private async createPodImpl(body: string, visibility: PodVisibility, account: Account) {
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
    return result[1];
  }

  private async createPodImplWithPassword(body: string, password: string, account: Account) {
    const visibility: PodVisibility = "password";

    const iv = randomBytes(12);
    const algo = "aes-256-ccm";
    const key = randomBytes(32);
    const cipher = createCipheriv(algo, key, iv, { authTagLength: 16 });

    let encrypted_body = cipher.update(body, "utf8", "hex");
    encrypted_body += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");
    const password_info: any = {
      algo: algo,
      authTag: authTag,
      iv: iv.toString("hex"),
      key: key.toString("hex"),
      password: hash(password)
    };

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
          body: encrypted_body,
          visibility: visibility,
          password: password_info
        }
      }),
      this.dbService.prisma.account.update({
        where: { id: account.id },
        data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
      })
    ]);
    return result[1];
  }

  @Query(() => ResultObject)
  async getDecryptedPodBody(
    @SessionValidater() ctx,
    @Args("id", { type: () => String }) id: string,
    @Args("password", { type: () => String }) password: string
  ) {
    const res = new ResultObject();
    await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const pod = await this.dbService.prisma.pod.findUnique({
        where: { id: id },
        select: { body: true, password: true }
      });
      const json: any = pod.password;

      if (hash(password) !== json.password) throw new Error("password unmatch");

      const iv = Buffer.from(json.iv, "hex");
      const key = Buffer.from(json.key, "hex");
      const authTag = Buffer.from(json.authTag, "hex");
      
      const cipher = createDecipheriv(json.algo, key, iv, { authTagLength: 16 });
      cipher.setAuthTag(authTag);
      let decrypted_body = cipher.update(pod.body, "hex", "utf8");
      decrypted_body += cipher.final("utf8");

      res.value = true;
      res.message = decrypted_body;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }

  @Mutation(() => ResultObject)
  async createPod(
    @SessionValidater() ctx,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("password", { type: () => String, nullable: true }) password?: string
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      let result: Account;
      switch (visibility) {
        case "password":
          result = await this.createPodImplWithPassword(body, password, account);
          break;
        default:
          result = await this.createPodImpl(body, visibility, account);
          break;
      }
      const session_me = await this.dbService.redis.get(`account/${account.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result));
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

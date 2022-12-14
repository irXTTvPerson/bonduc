import { Resolver, Args, Mutation, Query } from "@nestjs/graphql";
import { Pod } from "./pod.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Account, PodVisibility, Pod as PrismaPod, TimelineType } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { hash } from "../lib/hash";
import { convertVisibilityCc, convertVisibilityTo } from "./address.converter";
import { HomeTimeline } from "../timeline/htl.model";

@Resolver(Pod)
export class PodResolver {
  private readonly logger = new Logger("PodResolver");

  constructor(private readonly dbService: DBService) {}

  private async createPodImpl(
    body: string,
    visibility: PodVisibility,
    account: Account,
    timeline_type: TimelineType
  ) {
    const count = await this.dbService.prisma.account.findUnique({
      where: { id: account.id },
      select: { pod_count: true }
    });
    const result = await this.dbService.prisma.$transaction([
      this.dbService.prisma.pod.create({
        data: {
          account_id: account.id,
          to: convertVisibilityTo(visibility, account),
          cc: convertVisibilityCc(visibility, account),
          body: body,
          visibility: visibility,
          timeline_type: timeline_type
        },
        include: { from: true }
      }),
      this.dbService.prisma.account.update({
        where: { id: account.id },
        data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
      })
    ]);
    return { pod: result[0], account: result[1] };
  }

  @Mutation(() => Pod, { nullable: true })
  async createPod(
    @SessionValidater() ctx,
    @Args("body", { type: () => String }) body: string,
    @Args("visibility", { type: () => PodVisibility }) visibility: PodVisibility,
    @Args("timeline_type", { type: () => TimelineType }) timeline_type: TimelineType,
    @Args("password", { type: () => String, nullable: true }) password?: string
  ) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      let result: { pod: PrismaPod & { from: Account }; account: Account };
      if (password) {
        result = await this.createPodImplWithPassword(
          body,
          password,
          me,
          visibility,
          timeline_type
        );
      } else {
        result = await this.createPodImpl(body, visibility, me, timeline_type);
      }
      const session_me = await this.dbService.redis.get(`account/${me.id}`);
      await this.dbService.redis.set(`session/${session_me}`, JSON.stringify(result.account));
      result.pod["favorited"] = false;
      result.pod["mypod"] = true;
      result.pod["encrypted"] = password ? true : false;
      return result.pod;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  private async getDpPod(id: string, me: Account) {
    try {
      const dp = await this.dbService.prisma.dpPod.findUnique({
        where: { id: id },
        include: { from: true }
      });
      if (dp.content_type === "pod") {
        const [pod, fav] = await Promise.all([
          this.dbService.prisma.pod.findUnique({
            where: { id: dp.content_id },
            include: { from: true }
          }),
          this.dbService.pool[2].favorite.findUnique({
            where: {
              content_id_account_id: {
                content_id: dp.content_id,
                account_id: me.id
              }
            }
          })
        ]);
        dp["pod"] = pod;
        dp["pod"]["mypod"] = pod.from.id === me.id;
        dp["pod"]["favorited"] = fav ? true : false;
        dp["pod"]["encrypted"] = pod.password === null ? false : true;
      } else {
        const [pod, fav] = await Promise.all([
          this.dbService.prisma.qpPod.findUnique({
            where: { id: dp.content_id },
            include: { from: true }
          }),
          this.dbService.pool[2].favorite.findUnique({
            where: {
              content_id_account_id: {
                content_id: dp.content_id,
                account_id: me.id
              }
            }
          })
        ]);
        dp["qp"] = pod;
        dp["qp"]["mypod"] = pod.from.id === me.id;
        dp["qp"]["favorited"] = fav ? true : false;
      }
      return dp;
    } catch (e) {
      // this.logger.error(e);
    }
    return null;
  }

  private async getQpPod(id: string, me: Account) {
    try {
      const qp = await this.dbService.prisma.qpPod.findUnique({
        where: { id: id },
        include: { from: true }
      });
      const qpfav = await this.dbService.pool[0].favorite.findUnique({
        where: {
          content_id_account_id: {
            content_id: qp.id,
            account_id: me.id
          }
        }
      });
      qp["mypod"] = qp.from.id === me.id;
      qp["favorited"] = qpfav ? true : false;
      if (qp.content_type === "pod") {
        const [pod, fav] = await Promise.all([
          this.dbService.prisma.pod.findUnique({
            where: { id: qp.content_id },
            include: { from: true }
          }),
          this.dbService.pool[2].favorite.findUnique({
            where: {
              content_id_account_id: {
                content_id: qp.content_id,
                account_id: me.id
              }
            }
          })
        ]);
        qp["pod"] = pod;
        qp["pod"]["mypod"] = pod.from.id === me.id;
        qp["pod"]["favorited"] = fav ? true : false;
        qp["pod"]["encrypted"] = pod.password === null ? false : true;
      } else {
        const [pod, fav] = await Promise.all([
          this.dbService.prisma.qpPod.findUnique({
            where: { id: qp.content_id },
            include: { from: true }
          }),
          this.dbService.pool[2].favorite.findUnique({
            where: {
              content_id_account_id: {
                content_id: qp.content_id,
                account_id: me.id
              }
            }
          })
        ]);
        qp["qp"] = pod;
        qp["qp"]["mypod"] = pod.from.id === me.id;
        qp["qp"]["favorited"] = fav ? true : false;
      }
      return qp;
    } catch (e) {
      // this.logger.error(e);
    }
    return null;
  }

  private async getPodImpl(id: string, me: Account) {
    try {
      const [pod, fav] = await Promise.all([
        this.dbService.prisma.pod.findUnique({ where: { id: id }, include: { from: true } }),
        this.dbService.prisma.favorite.findUnique({
          where: {
            content_id_account_id: {
              content_id: id,
              account_id: me.id
            }
          }
        })
      ]);
      pod["favorited"] = fav ? true : false;
      pod["mypod"] = pod.account_id === me.id;
      pod["encrypted"] = pod.password === null ? false : true;
      return pod;
    } catch (e) {
      // this.logger.error(e);
    }
    return null;
  }

  @Query(() => HomeTimeline, { nullable: true })
  async getPod(@SessionValidater() ctx, @Args("id", { type: () => String }) id: string) {
    const me = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    const [pod, dp, qp] = await Promise.all([
      this.getPodImpl(id, me),
      this.getDpPod(id, me),
      this.getQpPod(id, me)
    ]);
    return { pod: pod, dp: dp, qp: qp };
  }

  private async createPodImplWithPassword(
    body: string,
    password: string,
    account: Account,
    visibility: PodVisibility,
    timeline_type: TimelineType
  ) {
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
          to: convertVisibilityTo(visibility, account),
          cc: convertVisibilityCc(visibility, account),
          body: encrypted_body,
          visibility: visibility,
          password: password_info,
          timeline_type: timeline_type
        },
        include: { from: true }
      }),
      this.dbService.prisma.account.update({
        where: { id: account.id },
        data: { pod_count: count.pod_count + 1, last_pod_at: new Date() }
      })
    ]);
    return { pod: result[0], account: result[1] };
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
}

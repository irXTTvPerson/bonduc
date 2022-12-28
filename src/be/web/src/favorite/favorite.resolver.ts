import { Resolver, Args, Mutation } from "@nestjs/graphql";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";
import { DpContentType, QpContentType } from "@prisma/client";
type ContentType = DpContentType | QpContentType;

@Resolver()
export class FavoriteResolver {
  private readonly logger = new Logger("FavoriteResolver");

  constructor(private readonly dbService: DBService) {}

  @Mutation(() => ResultObject)
  async postFavorite(
    @SessionValidater() ctx,
    @Args("rp_id", { type: () => String }) rp_id: string,
    @Args("type", { type: () => String }) type: ContentType
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      if (type === "pod") {
        const pod = await this.dbService.prisma.pod.findUnique({
          select: { favorite_count: true },
          where: { id: rp_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.create({
            data: {
              rp_id: rp_id,
              account_id: account.id
            }
          }),
          this.dbService.prisma.pod.update({
            where: { id: rp_id },
            data: { favorite_count: pod.favorite_count + 1 }
          })
        ]);
      } else if (type === "qp") {
        const pod = await this.dbService.prisma.qpPod.findUnique({
          select: { favorite_count: true },
          where: { id: rp_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.create({
            data: {
              rp_id: rp_id,
              account_id: account.id
            }
          }),
          this.dbService.prisma.qpPod.update({
            where: { id: rp_id },
            data: { favorite_count: pod.favorite_count + 1 }
          })
        ]);
      }
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }

  @Mutation(() => ResultObject)
  async undoFavorite(
    @SessionValidater() ctx,
    @Args("rp_id", { type: () => String }) rp_id: string,
    @Args("type", { type: () => String }) type: ContentType
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      if (type === "pod") {
        const pod = await this.dbService.prisma.pod.findUnique({
          select: { favorite_count: true },
          where: { id: rp_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.delete({
            where: {
              rp_id_account_id: {
                rp_id: rp_id,
                account_id: account.id
              }
            }
          }),
          this.dbService.prisma.pod.update({
            where: { id: rp_id },
            data: { favorite_count: pod.favorite_count - 1 }
          })
        ]);
      } else if (type === "qp") {
        const pod = await this.dbService.prisma.qpPod.findUnique({
          select: { favorite_count: true },
          where: { id: rp_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.delete({
            where: {
              rp_id_account_id: {
                rp_id: rp_id,
                account_id: account.id
              }
            }
          }),
          this.dbService.prisma.qpPod.update({
            where: { id: rp_id },
            data: { favorite_count: pod.favorite_count - 1 }
          })
        ]);
      }
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }
}

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
    @Args("content_id", { type: () => String }) content_id: string,
    @Args("content_type", { type: () => String }) content_type: ContentType
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      if (content_type === "pod") {
        const pod = await this.dbService.prisma.pod.findUnique({
          select: { favorite_count: true },
          where: { id: content_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.create({
            data: {
              content_id: content_id,
              account_id: account.id
            }
          }),
          this.dbService.prisma.pod.update({
            where: { id: content_id },
            data: { favorite_count: pod.favorite_count + 1 }
          })
        ]);
      } else if (content_type === "qp") {
        const pod = await this.dbService.prisma.qpPod.findUnique({
          select: { favorite_count: true },
          where: { id: content_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.create({
            data: {
              content_id: content_id,
              account_id: account.id
            }
          }),
          this.dbService.prisma.qpPod.update({
            where: { id: content_id },
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
    @Args("content_id", { type: () => String }) content_id: string,
    @Args("content_type", { type: () => String }) content_type: ContentType
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      if (content_type === "pod") {
        const pod = await this.dbService.prisma.pod.findUnique({
          select: { favorite_count: true },
          where: { id: content_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.delete({
            where: {
              content_id_account_id: {
                content_id: content_id,
                account_id: account.id
              }
            }
          }),
          this.dbService.prisma.pod.update({
            where: { id: content_id },
            data: { favorite_count: pod.favorite_count - 1 }
          })
        ]);
      } else if (content_type === "qp") {
        const pod = await this.dbService.prisma.qpPod.findUnique({
          select: { favorite_count: true },
          where: { id: content_id }
        });
        await this.dbService.prisma.$transaction([
          this.dbService.prisma.favorite.delete({
            where: {
              content_id_account_id: {
                content_id: content_id,
                account_id: account.id
              }
            }
          }),
          this.dbService.prisma.qpPod.update({
            where: { id: content_id },
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

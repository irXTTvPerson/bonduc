import { Resolver, Args, Mutation } from "@nestjs/graphql";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";

@Resolver()
export class FavoriteResolver {
  private readonly logger = new Logger("FavoriteResolver");

  constructor(private readonly dbService: DBService) {}

  @Mutation(() => ResultObject)
  async postFavorite(
    @SessionValidater() ctx,
    @Args("rp_id", { type: () => String }) pod_id: string
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const pod = await this.dbService.prisma.pod.findUnique({
        select: { favorite_count: true },
        where: { id: pod_id }
      });
      await this.dbService.prisma.$transaction([
        this.dbService.prisma.favorite.create({
          data: {
            rp_id: pod_id,
            account_id: account.id
          }
        }),
        this.dbService.prisma.pod.update({
          where: { id: pod_id },
          data: { favorite_count: pod.favorite_count + 1 }
        })
      ]);
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
    @Args("rp_id", { type: () => String }) pod_id: string
  ) {
    const res = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const pod = await this.dbService.prisma.pod.findUnique({
        select: { favorite_count: true },
        where: { id: pod_id }
      });
      await this.dbService.prisma.$transaction([
        this.dbService.prisma.favorite.delete({
          where: {
            rp_id_account_id: {
              rp_id: pod_id,
              account_id: account.id
            }
          }
        }),
        this.dbService.prisma.pod.update({
          where: { id: pod_id },
          data: { favorite_count: pod.favorite_count - 1 }
        })
      ]);
      res.value = true;
    } catch (e) {
      this.logger.error(e);
      res.value = false;
    } finally {
      return res;
    }
  }
}

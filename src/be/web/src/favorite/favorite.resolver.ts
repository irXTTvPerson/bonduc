import { Resolver, Args, Mutation } from "@nestjs/graphql";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account as PrismaAccount } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";

@Resolver()
export class FavoriteResolver {
  private readonly logger = new Logger("FavoriteResolver");

  @Mutation(() => ResultObject)
  async postFavorite(
    @SessionValidater() account: PrismaAccount,
    @Args("rp_id", { type: () => String }) pod_id: string
  ) {
    const res = new ResultObject();
    try {
      const pod = await prisma.pod.findUnique({
        select: { favorite_count: true },
        where: { id: pod_id }
      });
      await prisma.$transaction([
        prisma.favorite.create({
          data: {
            rp_id: pod_id,
            account_id: account.id
          }
        }),
        prisma.pod.update({
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
    @SessionValidater() account: PrismaAccount,
    @Args("rp_id", { type: () => String }) pod_id: string
  ) {
    const res = new ResultObject();
    try {
      const pod = await prisma.pod.findUnique({
        select: { favorite_count: true },
        where: { id: pod_id }
      });
      await prisma.$transaction([
        prisma.favorite.delete({
          where: {
            rp_id_account_id: {
              rp_id: pod_id,
              account_id: account.id
            }
          }
        }),
        prisma.pod.update({
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

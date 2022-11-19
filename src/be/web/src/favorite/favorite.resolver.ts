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
    @Args("target_pod_id", { type: () => String }) target_pod_id: string
  ) {
    const res = new ResultObject();
    try {
      const pod = await prisma.pod.findUnique({
        select: {
          id: true,
          account_id: true,
          favorite_count: true,
          from: {
            select: {
              id: true
            }
          }
        },
        where: {
          id: target_pod_id
        }
      });
      if (!pod) {
        this.logger.error(`postFavorite: pod ${target_pod_id} not found`);
        res.value = false;
        return res;
      }
      const f = await prisma.favorite.findFirst({
        where: {
          AND: {
            account_id: account.id,
            pod_id: target_pod_id
          }
        }
      });
      if (f) {
        this.logger.error(`postFavorite: favorite already exists`);
        res.value = false;
        return res;
      }
      await prisma.$transaction([
        prisma.favorite.create({
          data: {
            account_id: account.id,
            pod_id: target_pod_id
          }
        }),
        prisma.notification.create({
          data: {
            type: "liked",
            from_account_id: account.id,
            to_account_id: pod.from.id
          }
        }),
        prisma.pod.update({
          where: {
            id: pod.id
          },
          data: {
            favorite_count: pod.favorite_count + 1
          }
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
    @Args("target_pod_id", { type: () => String }) target_pod_id: string
  ) {
    const res = new ResultObject();
    try {
      const pod = await prisma.pod.findUnique({
        select: {
          id: true,
          favorite_count: true
        },
        where: {
          id: target_pod_id
        }
      });
      if (!pod) {
        this.logger.error(`undoFavorite: pod ${target_pod_id} not found`);
        res.value = false;
        return res;
      }
      const f = await prisma.favorite.findFirst({
        where: {
          AND: {
            account_id: account.id,
            pod_id: target_pod_id
          }
        }
      });
      if (!f) {
        this.logger.error(`undoFavorite: favorite not found`);
        res.value = false;
        return res;
      }
      await prisma.$transaction([
        prisma.favorite.delete({ where: { id: f.id } }),
        prisma.pod.update({
          where: {
            id: pod.id
          },
          data: {
            favorite_count: pod.favorite_count - 1
          }
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

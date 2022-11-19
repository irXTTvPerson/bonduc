import { Resolver, Query, Args } from "@nestjs/graphql";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "./account.model";
import { Account as PrismaAccount } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";

@Resolver()
export class AccountResolver {
  private readonly logger = new Logger("AccountResolver");

  @Query(() => ResultObject)
  async isMe(
    @SessionValidater() account: PrismaAccount,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const me = new ResultObject();
    try {
      const a = await prisma.account.findUnique({
        where: {
          identifier_name: identifier_name
        }
      });
      if (a.id === account.id) {
        me.value = true;
      } else {
        me.value = false;
      }
    } catch (e) {
      this.logger.error(e);
      me.value = false;
    } finally {
      return me;
    }
  }

  @Query(() => Account, { nullable: true })
  async getAccount(
    @SessionValidater() account: PrismaAccount,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    try {
      const a = await prisma.account.findUnique({
        where: {
          identifier_name: identifier_name
        }
      });
      if (!a) {
        this.logger.error(`getAccount: ${identifier_name} not found`);
        return null;
      }
      return a;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}
import { Resolver, Query, Args } from "@nestjs/graphql";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account, Myself } from "./account.model";
import { Account as PrismaAccount } from "@prisma/client";
import { Logger } from "@nestjs/common";

@Resolver()
export class AccountResolver {
  private readonly logger = new Logger("AccountResolver");

  @Query(() => Myself)
  async isMe(
    @SessionValidater() account: PrismaAccount,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const me = new Myself();
    const a = await prisma.account.findUnique({
      where: {
        identifier_name: identifier_name
      }
    });
    if (a.id === account.id) {
      me.is_me = true;
    } else {
      me.is_me = false;
    }
    return me;
  }

  @Query(() => Account, { nullable: true })
  async getAccount(
    @SessionValidater() account: PrismaAccount,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
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
  }
}

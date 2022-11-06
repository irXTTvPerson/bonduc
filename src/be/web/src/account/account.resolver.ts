import { Resolver, Query, Args } from "@nestjs/graphql";
import { prisma } from "../lib/prisma";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "./account.model";
import { Account as PrismaAccount } from "@prisma/client";

@Resolver()
export class AccountResolver {
  @Query(() => Account, { nullable: true })
  async myself(@SessionValidater() account: PrismaAccount) {
    return await prisma.account.findUnique({
      where: {
        identifier_name: account.identifier_name
      }
    });
  }

  @Query(() => Account, { nullable: true })
  async getAccount(
    @SessionValidater() account: PrismaAccount,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    return await prisma.account.findUnique({
      where: {
        identifier_name: identifier_name
      }
    });
  }
}

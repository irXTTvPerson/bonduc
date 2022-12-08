import { Resolver, Query, Args } from "@nestjs/graphql";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Account } from "./account.model";
import { Logger } from "@nestjs/common";
import { ResultObject } from "../result/result.model";
import { DBService } from "../db/db.service";

@Resolver()
export class AccountResolver {
  private readonly logger = new Logger("AccountResolver");

  constructor(private readonly dbService: DBService) {}

  @Query(() => ResultObject)
  async isMe(
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    const me = new ResultObject();
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const a = await this.dbService.prisma.account.findUnique({
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
    @SessionValidater() ctx,
    @Args("identifier_name", { type: () => String }) identifier_name: string
  ) {
    await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      const a = await this.dbService.prisma.account.findUnique({
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

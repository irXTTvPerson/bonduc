import { Resolver, Query } from "@nestjs/graphql";
import { HomeTimeline } from "./htl.model";
import { SessionValidater, accountValidator } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { Mixer } from "./htl.mixer";
import { DBService } from "../db/db.service";

@Resolver()
export class HTLResolver {
  private readonly logger = new Logger("HTLResolver");
  private readonly mixer = new Mixer(this.dbService);

  constructor(private readonly dbService: DBService) {}

  @Query(() => [HomeTimeline], { nullable: "itemsAndList" })
  async getHTL(@SessionValidater() ctx) {
    const account = await accountValidator(ctx.req, ctx.token, this.dbService.redis);
    try {
      return await this.mixer.build(account);
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}

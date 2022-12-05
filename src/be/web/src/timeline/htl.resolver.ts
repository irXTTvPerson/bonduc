import { Resolver, Query } from "@nestjs/graphql";
import { HomeTimeline } from "./htl.model";
import { SessionValidater } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { Mixer } from "./htl.mixer";

@Resolver()
export class HTLResolver {
  private readonly logger = new Logger("HTLResolver");
  private readonly mixer = new Mixer();

  @Query(() => [HomeTimeline], { nullable: "itemsAndList" })
  async getHTL(@SessionValidater() account) {
    try {
      return await this.mixer.build(account);
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}

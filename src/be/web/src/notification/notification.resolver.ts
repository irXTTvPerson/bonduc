import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { Notification } from "./notification.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";
import { Account as GqlAccount } from "../account/account.model";
import { Logger } from "@nestjs/common";

class QueryHelper {
  hasBuildSelectQuery: boolean = false;
  selectQuery: string = "";

  /*
  select 
    * <- ここをfrom_account, to_account, notificationにしたい
  from 
    "Account" a 
  inner join 
    "Notification" n 
  on
    a.id = n.to_account_id
  and
    a.identifier_name = $1
  inner join
    "Account" b
  on
    b.id = n.from_account_id
  order by 
    n.created_at desc
  limit
    $2
  */
  async build() {
    if (this.hasBuildSelectQuery) {
      return this.selectQuery;
    }
    this.hasBuildSelectQuery = true;

    this.selectQuery = "select ";
    let res: any = await prisma.$queryRawUnsafe(
      `select column_name from information_schema.columns where table_name = 'Account' order by ordinal_position;`
    );

    const account = new GqlAccount();
    for (const i of res) {
      // 不要な列をselectしないよう除外
      if (!(i.column_name in account)) {
        continue;
      }
      this.selectQuery += `a.${i.column_name} as __to_${i.column_name},`;
      this.selectQuery += `b.${i.column_name} as __from_${i.column_name},`;
    }
    res = await prisma.$queryRawUnsafe(
      `select column_name from information_schema.columns where table_name = 'Notification' order by ordinal_position;`
    );
    for (const i of res) {
      this.selectQuery += `n.${i.column_name},`;
    }
    this.selectQuery = this.selectQuery.slice(0, -1);
    this.selectQuery += " ";
    this.selectQuery += `from "Account" a inner join "Notification" n on a.id = n.to_account_id and a.identifier_name = $1 inner join "Account" b on b.id = n.from_account_id order by n.created_at desc limit $2;`;
    return this.selectQuery;
  }

  toNotification(res: any) {
    const ret: Notification[] = [];
    for (const row of res) {
      const nt: Notification = new Notification();
      for (const key in row) {
        const from_key: string | undefined = key.split("__from_")[1];
        const to_key: string | undefined = key.split("__to_")[1];
        if (from_key && from_key in nt.from) nt.from[from_key] = row[key];
        else if (to_key && to_key in nt.to) nt.to[to_key] = row[key];
        else if (key in nt) nt[key] = row[key];
      }
      ret.push(nt);
    }
    return ret;
  }
}

@Resolver()
export class NotificationResolver {
  helper: QueryHelper = new QueryHelper();
  private readonly logger = new Logger("NotificationResolver");

  @Query(() => [Notification], { nullable: "itemsAndList" })
  async getNotification(@SessionValidater() account: Account) {
    try {
      const res: any = await prisma.$queryRawUnsafe(
        await this.helper.build(),
        account.identifier_name,
        Config.limit.notification.find_at_once
      );
      return this.helper.toNotification(res);
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  @Mutation(() => Notification, { nullable: true })
  async openNotification(
    @SessionValidater() account: Account,
    @Args("id", { type: () => String }) id: string
  ) {
    try {
      return await prisma.notification.update({
        where: {
          id: id
        },
        data: {
          opened: true
        }
      });
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}

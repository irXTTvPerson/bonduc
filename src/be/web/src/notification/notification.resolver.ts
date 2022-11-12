import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { Notification } from "./notification.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";
import { accountSelector } from "../lib/const";
import { buildAccountFromTo } from "../lib/const";

const query = `
select 
  ${accountSelector}
  n.type,
  n.id,
  n.created_at,
  n.deactivated,
  n.opened
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
`;

@Resolver()
export class NotificationResolver {
  buildGqlObject = (res: any, account: Account) => {
    const ret = [];
    for (const i of res) {
      ret.push({
        type: i.type,
        id: i.id,
        opened: i.opened,
        created_at: i.created_at,
        deactivated: i.deactivated,
        ...buildAccountFromTo(i, account.identifier_name)
      });
    }
    return ret;
  };

  @Query(() => [Notification], { nullable: "itemsAndList" })
  async getNotificationToMe(@SessionValidater() account: Account) {
    const res: any = await prisma.$queryRawUnsafe(
      query,
      account.identifier_name,
      Config.limit.notification.find_at_once
    );

    return this.buildGqlObject(res, account);
  }

  @Mutation(() => Notification, { nullable: true })
  async openNotification(
    @SessionValidater() account: Account,
    @Args("id", { type: () => String }) id: string
  ) {
    return await prisma.notification.update({
      where: {
        id: id
      },
      data: {
        opened: true
      }
    });
  }
}

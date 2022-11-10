import { Resolver, Query, Args } from "@nestjs/graphql";
import { Notification } from "./notification.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Logger } from "@nestjs/common";
import { Account } from "@prisma/client";

const query = (arg: { limit: number; to?: string; from?: string }) => `
select 
	a.screen_name as to_screen_name,
	a.identifier_name as to_identifier_name,
	a.created_at as to_created_at,
	a.header_url as to_header_url,
	a.icon_url as to_icon_url,
	b.screen_name as from_screen_name,
	b.identifier_name as from_identifier_name,
	b.created_at as from_created_at,
	b.header_url as from_header_url,
	b.icon_url as from_icon_url,
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
${
  arg.to
    ? `and
  a.identifier_name = '${arg.to}'
`
    : ""
}
inner join
	"Account" b
on
	b.id = n.from_account_id
${
  arg.from
    ? `and
  b.identifier_name = '${arg.from}'
`
    : ""
}
order by 
	n.created_at desc
limit
	${arg.limit}
`;

@Resolver()
export class NotificationResolver {
  private readonly logger = new Logger("NotificationResolver");

  buildGqlObject = (res: any, account: Account) => {
    const ret = [];
    for (const i of res) {
      ret.push({
        type: i.type,
        id: i.id,
        opened: i.opened,
        created_at: i.created_at,
        deactivated: i.deactivated,

        from: {
          identifier_name: i.from_identifier_name,
          screen_name: i.from_screen_name,
          created_at: i.from_created_at,
          header_url: i.from_header_url,
          icon_url: i.from_icon_url,
          is_me: account.identifier_name === i.from_identifier_name
        },
        to: {
          identifier_name: i.to_identifier_name,
          screen_name: i.to_screen_name,
          created_at: i.to_created_at,
          header_url: i.to_header_url,
          icon_url: i.to_icon_url,
          is_me: account.identifier_name === i.to_identifier_name
        }
      });
    }
    return ret;
  };

  @Query(() => [Notification], { nullable: "itemsAndList" })
  async getNotificationToMe(@SessionValidater() account: Account) {
    const res: any = await prisma.$queryRawUnsafe(
      query({
        limit: Config.limit.notification.find_at_once,
        to: account.identifier_name
      })
    );

    return this.buildGqlObject(res, account);
  }

  @Query(() => Notification, { nullable: true })
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

import { Resolver, Query, Args } from "@nestjs/graphql";
import { Follow } from "./follow.model";
import { prisma } from "../lib/prisma";
import { Config } from "../config";
import { SessionValidater } from "../auth/gql.strategy";
import { Account } from "@prisma/client";
import { accountSelector, buildAccountFromTo } from "../lib/const";

const query = `
select 
  ${accountSelector}
	n.id,
	n.created_at
from 
	"Account" a 
inner join 
	"Follow" n 
on
	a.id = n.to_account_id
 and
  a.identifier_name = $1
inner join
	"Account" b
on
	b.id = n.from_account_id
 and
  b.identifier_name = $2
order by 
	n.created_at desc
limit
  $3
`;

const queryFollower = `
select 
  ${accountSelector}
	n.id,
	n.created_at
from 
	"Account" a 
inner join 
	"Follow" n 
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

const queryFollowing = `
select 
  ${accountSelector}
	n.id,
	n.created_at
from 
	"Account" a 
inner join 
	"Follow" n 
on
	a.id = n.to_account_id
inner join
	"Account" b
on
	b.id = n.from_account_id
and
  b.identifier_name = $1
order by 
	n.created_at desc
limit
  $2
`;

@Resolver()
export class FollowResolver {
  buildFollowObject(i: any, identifier_name: string): Follow {
    return {
      id: i.id,
      created_at: i.created_at,
      ...buildAccountFromTo(i, identifier_name)
    };
  }

  buildGqlObjectOne(res: any, identifier_name: string): Follow | null {
    for (const i of res) {
      // １件しかないはずなので先頭を即return
      return this.buildFollowObject(i, identifier_name);
    }
    return null;
  }

  buildGqlObject(res: any, identifier_name: string): Follow[] {
    const ret: any = [];
    for (const i of res) {
      ret.push(this.buildFollowObject(i, identifier_name));
    }
    return ret;
  }

  @Query(() => Follow, { nullable: true })
  async isFollowing(
    @SessionValidater() account: Account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    const res: any = await prisma.$queryRawUnsafe(
      query,
      target_identifier_name,
      account.identifier_name,
      Config.limit.follow.find_at_once
    );

    return this.buildGqlObjectOne(res, target_identifier_name);
  }

  @Query(() => [Follow], { nullable: "itemsAndList" })
  async getFollower(
    @SessionValidater() account: Account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    const res: any = await prisma.$queryRawUnsafe(
      queryFollower,
      target_identifier_name,
      Config.limit.follow.find_at_once
    );

    return this.buildGqlObject(res, account.identifier_name);
  }

  @Query(() => [Follow], { nullable: "itemsAndList" })
  async getFollowing(
    @SessionValidater() account: Account,
    @Args("target_identifier_name", { type: () => String }) target_identifier_name: string
  ) {
    const res: any = await prisma.$queryRawUnsafe(
      queryFollowing,
      target_identifier_name,
      Config.limit.follow.find_at_once
    );

    return this.buildGqlObject(res, account.identifier_name);
  }
}

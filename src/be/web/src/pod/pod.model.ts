import { Field, ObjectType } from "@nestjs/graphql";
import { Account } from "../account/account.model";

@ObjectType()
export class Pod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field()
  updated_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => [String])
  to: string[] = [""];

  @Field(() => [String], { nullable: "itemsAndList" })
  cc?: string[] = null;

  @Field(() => Account)
  from: Account = new Account();

  @Field()
  body: string = "";

  @Field()
  favorite_count: number = 0;

  @Field()
  favorited: boolean = false;
}

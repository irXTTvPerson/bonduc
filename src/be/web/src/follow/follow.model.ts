import { Field, ObjectType } from "@nestjs/graphql";
import { Account } from "../account/account.model";

@ObjectType()
export class Follow {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  to: Account = new Account();

  @Field(() => Account)
  from: Account = new Account();
}

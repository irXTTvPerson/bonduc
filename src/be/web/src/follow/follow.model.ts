import { Field, ObjectType } from "@nestjs/graphql";
import { Account } from "../account/account.model";

@ObjectType()
export class Follow {
  @Field()
  id: string;

  @Field()
  created_at: Date;

  @Field(() => Account)
  to: Account;

  @Field(() => Account)
  from: Account;
}

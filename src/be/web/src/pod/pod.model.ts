import { Field, ObjectType } from "@nestjs/graphql";
import { Account } from "../account/account.model";

@ObjectType()
export class Pod {
  @Field()
  id: string;

  @Field()
  created_at: Date;

  @Field({ nullable: true })
  updated_at?: Date;

  @Field(() => [String])
  to: string[];

  @Field(() => [String], { nullable: "itemsAndList" })
  cc?: string[];

  @Field(() => Account, { nullable: true })
  from: Account;

  @Field()
  body: string;
}

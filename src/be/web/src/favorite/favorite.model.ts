import { Field, ObjectType } from "@nestjs/graphql";
import { Account } from "../account/account.model";
import { Pod } from "../pod/pod.model";

@ObjectType()
export class Favorite {
  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field(() => Pod)
  to: Pod = new Pod();
}

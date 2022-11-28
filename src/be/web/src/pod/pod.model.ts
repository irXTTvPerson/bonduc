import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Account } from "../account/account.model";
import { PodVisibility } from "@prisma/client";

@ObjectType()
export class Pod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field()
  body: string = "";

  @Field()
  favorite_count: number = 0;

  @Field()
  dp_count: number = 0;

  @Field()
  favorited: boolean = false;

  @Field()
  visibility: PodVisibility = "global";
}

@ObjectType()
export class DpPod {
  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field(() => Pod)
  body: Pod = new Pod();

  @Field()
  visibility: PodVisibility = "global";
}

registerEnumType(PodVisibility, { name: "PodVisibility" });

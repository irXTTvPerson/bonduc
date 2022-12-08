import { Field, ObjectType, registerEnumType, Int } from "@nestjs/graphql";
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

  @Field(() => Int)
  favorite_count: number = 0;

  @Field(() => Int)
  rp_count: number = 0;

  @Field()
  favorited: boolean = false;

  @Field()
  visibility: PodVisibility = "global";

  @Field()
  mypod: boolean = false;
}

@ObjectType()
export class DpPod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field(() => Pod, { nullable: true })
  body?: Pod = null;

  @Field()
  visibility: PodVisibility = "global";
}

@ObjectType()
export class QpPod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field()
  body: string = "";

  @Field(() => Int)
  favorite_count: number = 0;

  @Field(() => Int)
  rp_count: number = 0;

  @Field()
  favorited: boolean = false;

  @Field()
  visibility: PodVisibility = "global";

  @Field()
  mypod: boolean = false;

  @Field(() => Pod, { nullable: true })
  quote?: Pod = null;
}

registerEnumType(PodVisibility, { name: "PodVisibility" });

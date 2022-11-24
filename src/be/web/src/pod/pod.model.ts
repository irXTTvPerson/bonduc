import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Account } from "../account/account.model";
import { PodType, PodVisibility } from "@prisma/client";

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

  @Field()
  type: PodType = "pod";

  @Field({ nullable: true })
  rp_from_id: string = null;

  @Field()
  visibility: PodVisibility = "global";
}

registerEnumType(PodType, { name: "PodType" });
registerEnumType(PodVisibility, { name: "PodVisibility" });

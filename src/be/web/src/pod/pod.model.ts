import { Field, ObjectType } from "@nestjs/graphql";

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

  @Field()
  from_account_id: string;

  @Field()
  body: string;
}

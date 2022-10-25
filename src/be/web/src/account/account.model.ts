import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Account {
  @Field({ nullable: true })
  created_at?: Date;

  @Field()
  screen_name: string;

  @Field()
  identifier_name: string;
}

import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Account {
  @Field()
  created_at: Date;

  @Field()
  screen_name: string;

  @Field()
  identifier_name: string;

  @Field()
  header_url: string;

  @Field()
  icon_url: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  is_me: boolean;
}

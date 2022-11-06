import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Account {
  // db上には確実に存在するがqueryの投げ方によっては空かもしれない
  @Field()
  created_at?: Date;

  @Field()
  screen_name: string;

  @Field()
  identifier_name: string;

  // db上には確実に存在するがqueryの投げ方によっては空かもしれない
  @Field()
  header_url?: string;

  // db上には確実に存在するがqueryの投げ方によっては空かもしれない
  @Field()
  icon_url?: string;

  @Field({ nullable: true })
  bio?: string;
}

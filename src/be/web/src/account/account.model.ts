import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Account {
  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field()
  screen_name: string = "";

  @Field()
  identifier_name: string = "";

  @Field()
  header_url: string = "";

  @Field()
  icon_url: string = "";

  @Field({ nullable: true })
  bio?: string = null;
}

@ObjectType()
export class Myself {
  @Field()
  is_me: boolean = false;
}

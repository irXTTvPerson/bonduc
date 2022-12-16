import { Field, ObjectType } from "@nestjs/graphql";
import { Account } from "../account/account.model";

export type NotificationType =
  | "FollowRequest"
  | "AcceptFollowRequest"
  | "RejectFollowRequest"
  | "Followed"
  | "INVALID";

@ObjectType()
export class Notification {
  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field()
  type: NotificationType = "INVALID";

  @Field()
  opened: boolean = false;

  @Field(() => Account)
  from: Account = new Account();
}

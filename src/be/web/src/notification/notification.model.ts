import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { NotificationType } from "@prisma/client";
import { Account } from "../account/account.model";

registerEnumType(NotificationType, { name: "NotificationType" });

@ObjectType()
export class Notification {
  @Field()
  id: string;

  @Field()
  created_at: Date;

  @Field()
  type: NotificationType;

  @Field({ nullable: true })
  context_uri?: string;

  @Field()
  opened: boolean;

  @Field(() => Account)
  to: Account;

  @Field(() => Account)
  from: Account;
}

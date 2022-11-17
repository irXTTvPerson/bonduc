import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { NotificationType } from "@prisma/client";
import { Account } from "../account/account.model";

registerEnumType(NotificationType, { name: "NotificationType" });

@ObjectType()
export class Notification {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field()
  type: NotificationType = "blocked";

  @Field({ nullable: true })
  context?: string = null;

  @Field()
  deactivated: boolean = false;

  @Field()
  opened: boolean = false;

  @Field(() => Account)
  to: Account = new Account();

  @Field(() => Account)
  from: Account = new Account();
}

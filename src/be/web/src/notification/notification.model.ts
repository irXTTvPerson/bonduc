import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { NotificationType } from "@prisma/client";

registerEnumType(NotificationType, { name: "NotificationType" });

@ObjectType()
export class Notification {
  @Field()
  id: string;

  @Field()
  created_at?: Date;

  @Field()
  type: NotificationType;

  @Field()
  opened: boolean;
}

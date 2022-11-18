import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ResultObject {
  @Field()
  value: boolean = false;

  @Field()
  message?: string = null;
}

import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ResultObject {
  @Field()
  value: boolean = false;

  @Field({ nullable: true })
  message?: string = null;
}

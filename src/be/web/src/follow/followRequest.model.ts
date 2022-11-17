import { Field, ObjectType } from "@nestjs/graphql";

export type FollowRequestStatus = "none" | "requested" | "rejected" | "accepted" | "error";

@ObjectType()
export class FollowRequest {
  @Field()
  status: FollowRequestStatus = "error";
}

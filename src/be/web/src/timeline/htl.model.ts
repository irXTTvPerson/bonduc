import { Field, ObjectType } from "@nestjs/graphql";
import { Pod, DpPod, QpPod, ReplyPod } from "../pod/pod.model";

@ObjectType()
export class HomeTimeline {
  @Field(() => Pod, { nullable: true })
  pod?: Pod = null;

  @Field(() => DpPod, { nullable: true })
  dp?: DpPod = null;

  @Field(() => QpPod, { nullable: true })
  qp?: QpPod = null;

  @Field(() => ReplyPod, { nullable: true })
  reply?: ReplyPod = null;
}

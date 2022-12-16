import { Field, ObjectType } from "@nestjs/graphql";
import { Pod, DpPod, QpPod } from "../pod/pod.model";

export type Type = "pod" | "dp" | "qp" | "err";

@ObjectType()
export class HomeTimeline {
  @Field()
  type: Type = "err";

  @Field(() => Pod, { nullable: true })
  pod?: Pod = null;

  @Field(() => DpPod, { nullable: true })
  dpPod?: DpPod = null;

  @Field(() => QpPod, { nullable: true })
  qpPod?: QpPod = null;
}

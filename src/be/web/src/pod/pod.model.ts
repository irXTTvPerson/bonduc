import { Field, ObjectType, registerEnumType, Int } from "@nestjs/graphql";
import { Account } from "../account/account.model";
import {
  PodVisibility,
  QpContentType,
  DpContentType,
  TimelineType,
  ReplyToType
} from "@prisma/client";

@ObjectType()
export class Pod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field()
  body: string = "";

  @Field(() => Int)
  favorite_count: number = 0;

  @Field(() => Int)
  rp_count: number = 0;

  @Field()
  favorited: boolean = false;

  @Field()
  visibility: PodVisibility = "login";

  @Field()
  mypod: boolean = false;

  @Field(() => TimelineType)
  timeline_type: TimelineType = "global";

  @Field()
  encrypted: boolean = false;

  @Field(() => Int)
  reply_count: number = 0;
}

@ObjectType()
export class ReplyPod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field()
  body: string = "";

  @Field(() => Int)
  favorite_count: number = 0;

  @Field(() => Int)
  rp_count: number = 0;

  @Field()
  favorited: boolean = false;

  @Field()
  visibility: PodVisibility = "login";

  @Field()
  mypod: boolean = false;

  @Field(() => TimelineType)
  timeline_type: TimelineType = "global";

  @Field(() => Int)
  reply_count: number = 0;

  @Field()
  reply_to_id: string = "";

  @Field()
  reply_to_type: ReplyToType = "pod";
}

@ObjectType()
export class QpPod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field()
  body: string = "";

  @Field(() => Int)
  favorite_count: number = 0;

  @Field(() => Int)
  rp_count: number = 0;

  @Field()
  favorited: boolean = false;

  @Field()
  visibility: PodVisibility = "login";

  @Field()
  mypod: boolean = false;

  @Field(() => TimelineType)
  timeline_type: TimelineType = "global";

  @Field(() => Pod, { nullable: true })
  pod?: Pod = null;

  // 無限に自己参照が続く可能性があるので1階層しか取得しない
  @Field(() => QpPod, { nullable: true })
  qp?: QpPod = null;

  @Field(() => ReplyPod, { nullable: true })
  reply?: ReplyPod = null;

  @Field(() => Int)
  reply_count: number = 0;
}

@ObjectType()
export class DpPod {
  @Field()
  id: string = "";

  @Field()
  created_at: Date = new Date("2000-01-01T00:00:00");

  @Field(() => Account)
  from: Account = new Account();

  @Field(() => Pod, { nullable: true })
  pod?: Pod = null;

  @Field(() => QpPod, { nullable: true })
  qp?: QpPod = null;

  @Field(() => ReplyPod, { nullable: true })
  reply?: ReplyPod = null;

  @Field()
  visibility: PodVisibility = "login";

  @Field(() => TimelineType)
  timeline_type: TimelineType = "global";
}

registerEnumType(PodVisibility, { name: "PodVisibility" });
registerEnumType(DpContentType, { name: "DpContentType" });
registerEnumType(QpContentType, { name: "QpContentType" });
registerEnumType(TimelineType, { name: "TimelineType" });
registerEnumType(ReplyToType, { name: "ReplyToType" });

import { Field, ObjectType, registerEnumType, Int } from "@nestjs/graphql";
import { Account } from "../account/account.model";
import { PodVisibility, QpContentType, DpContentType, TimelineType } from "@prisma/client";

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
  timeline_type: TimelineType = "home";

  @Field()
  encrypted: boolean = false;
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
  timeline_type: TimelineType = "home";

  @Field(() => Pod, { nullable: true })
  pod?: Pod = null;

  // 無限に自己参照が続く可能性があるので1階層しか取得しない
  @Field(() => QpPod, { nullable: true })
  qp?: QpPod = null;
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

  @Field()
  visibility: PodVisibility = "login";

  @Field(() => TimelineType)
  timeline_type: TimelineType = "home";
}

registerEnumType(PodVisibility, { name: "PodVisibility" });
registerEnumType(DpContentType, { name: "DpContentType" });
registerEnumType(QpContentType, { name: "QpContentType" });
registerEnumType(TimelineType, { name: "TimelineType" });

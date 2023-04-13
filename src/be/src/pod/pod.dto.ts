import { PodVisibility, TimelineType, PodType } from "@prisma/client";

type BodyJson = {
  media: string[]; // optional
  password: string; // PodTypeがencryptedの時必須
  quote_id: string; // PodTypeがquoteの時必須
  duplicate_id: string; // PodTypeがduplicateの時必須
  reply_id: string; // PodTypeがreplyの時必須
  body: string; // PodTypeがquote以外の時必須、PodTypeがencryptedの時は暗号化される
  unprintable_body: string; // PodTypeがpartialの時必須
  additional_body: string; // read_moreがtrueの時必須
  unprintable_additional_body: string; // PodTypeがpartialの時必須
  show_partial_for: string; // PodTypeがpartialの時必須
};

export class PostPodDto {
  expire_at?: Date;
  reveal_at?: Date;
  body: BodyJson;
  nsfw: boolean;
  read_more: boolean;
  root_thread_id?: string;
  visibility: PodVisibility;
  timeline_type: TimelineType;
  pod_type: PodType;
}

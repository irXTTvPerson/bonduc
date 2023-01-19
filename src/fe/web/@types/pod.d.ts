import { Account } from "./account"

export type PodVisibility =
  | "anyone"
  | "login"
  | "following"
  | "follower"
  | "mutual"
  | "mention"
  | "list"
  | "myself"

export type QpContentType = "pod" | "qp" | "reply"
export type DpContentType = "pod" | "qp" | "reply"
export type TimelineType = "home" | "local" | "global"
export type PodType = "pod" | "dp" | "qp" | "reply"
type ReplyToType = "pod" | "qp" | "reply"

export type Pod = {
  id: string
  created_at: string
  from: Account
  body: string
  favorite_count: number
  rp_count: number
  favorited: boolean
  visibility: PodVisibility
  mypod: boolean
  timeline_type: TimelineType
  encrypted: boolean
  reply_count: number
}

export type DpPod = {
  id: string
  created_at: string
  from: Account
  pod?: Pod
  qp?: QpPod
  reply?: ReplyPod
  visibility: PodVisibility
  timeline_type: TimelineType
}

export type QpPod = {
  id: string
  created_at: string
  from: Account
  body: string
  favorite_count: number
  rp_count: number
  favorited: boolean
  visibility: PodVisibility
  mypod: boolean
  timeline_type: TimelineType
  pod?: Pod
  qp?: QpPod
  reply?: ReplyPod
  reply_count: number
}

export type ReplyPod = {
  id: string
  created_at: string
  from: Account
  body: string
  favorite_count: number
  rp_count: number
  favorited: boolean
  visibility: PodVisibility
  mypod: boolean
  timeline_type: TimelineType
  reply_count: number
  reply_to_id: string
  reply_to_type: ReplyToType
}

export type BTLPod = Pod & {
  context: {
    decrypted: boolean
  }
}

type DpPodInternal = Omit<DpPod, "pod" | "qp" | "reply">

export type BTLDpPod = DpPodInternal & {
  pod?: BTLPod
  qp?: BTLQpPod
  reply?: BTLReplyPod
  context: {}
}

type QpPodInternal = Omit<QpPod, "pod" | "qp" | "reply">

export type BTLQpPod = QpPodInternal & {
  pod?: BTLPod
  qp?: BTLQpPod
  reply?: BTLReplyPod
  context: {}
}

export type BTLReplyPod = ReplyPod & {
  context: {}
}

export type NormalPod = BTLPod | BTLQpPod | BTLReplyPod

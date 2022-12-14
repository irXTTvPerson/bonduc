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

export type QpContentType = "pod" | "qp"
export type DpContentType = "pod" | "qp"
export type ContentType = QpContentType | DpContentType

export type TimelineType = "home" | "local" | "global"

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
}

export type DpPod = {
  id: string
  created_at: string
  from: Account
  pod?: Pod
  qp?: QpPod
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
}

export type BTLPod = Pod & {
  context: {
    decrypted: boolean
  }
}

type DpPodInternal = Omit<DpPod, "pod" | "qp">

export type BTLDpPod = DpPodInternal & {
  pod?: BTLPod
  qp?: BTLQpPod
  context: {}
}

type QpPodInternal = Omit<QpPod, "pod" | "qp">

export type BTLQpPod = QpPodInternal & {
  pod?: BTLPod
  qp?: BTLQpPod
  context: {}
}

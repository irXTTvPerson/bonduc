import { Account } from "./account"

export type PodVisibility =
  | "anyone"
  | "login"
  | "global"
  | "local"
  | "following"
  | "follower"
  | "mutual"
  | "mention"
  | "list"
  | "password"
  | "myself"

export type Type = "pod" | "qp"

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
  password?: string
  decrypted?: boolean
}

export type DpPod = {
  id: string
  created_at: string
  from: Account
  pod?: Pod
  qp?: QpPod
  visibility: PodVisibility
  type: Type
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
  pod?: Pod
  qp?: QpPod
  type: Type
}

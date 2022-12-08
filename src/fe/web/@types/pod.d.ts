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
}

export type DpPod = {
  id: string
  created_at: string
  from: Account
  body?: Pod
  visibility: PodVisibility
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
  quote?: Pod
}

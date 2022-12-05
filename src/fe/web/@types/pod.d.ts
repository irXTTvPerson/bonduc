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
  dp_count: number
  favorited: boolean
  visibility: PodVisibility
  mypod: boolean
}

export type DpPod = {
  created_at: string
  from: Account
  body: Pod
  visibility: PodVisibility
}

import { Account } from "./account"

export type Pod = {
  id: string
  created_at: string
  updated_at?: string
  to: string[]
  cc?: string[]
  from: Account
  body: string
  favorite_count: number
  favorited: boolean
  visibility: PodVisibility
  rp_from_id?: string
}

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

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
  type: PodType
  visibility: PodVisibility
  rp_from_id?: string
}

export type PodType = "pod" | "qp" | "dp" | "mention"

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

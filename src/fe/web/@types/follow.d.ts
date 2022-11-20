import { Account } from "./account"

export type Follow = {
  id: string
  created_at: string
  to: Account
  from: Account
}

export type FollowRequestStatus = "none" | "requested" | "rejected" | "accepted" | "error"

export type FollowRequest = {
  status: FollowRequestStatus = "error"
}

import { Account } from "./account"

export type NotificationType =
  | "FollowRequest"
  | "AcceptFollowRequest"
  | "RejectFollowRequest"
  | "Followed"
  | "INVALID"

export type Notification = {
  created_at: string
  type: NotificationType
  opened: boolean
  from: Account
}

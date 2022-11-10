export type Notification = {
  id: string
  created_at: string
  type:
    | "follow_request"
    | "follow_request_accepted"
    | "followed"
    | "muted"
    | "blocked"
    | "liked"
    | "RTed"
  context_uri?: string
  opened: boolean
  to: Account
  from: Account
}

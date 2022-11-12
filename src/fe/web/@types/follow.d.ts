import { Account } from "./account"

export type Follow = {
  id: string
  created_at: string
  to: Account
  from: Account
}

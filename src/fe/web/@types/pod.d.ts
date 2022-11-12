import { Account } from "./account"

export type Pod = {
  id: string
  created_at: string
  updated_at?: string
  to: string[]
  cc?: string[]
  from: Account
  body: string
}

import type { NextPage, GetServerSideProps } from "next"
import Image from "next/image"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styles from "../styles/Account.module.css"
import { GqlClient } from "../components/common/gql"
import { Account } from "../@types/account"
import { Notification } from "../@types/notification"
import { Follow } from "../@types/follow"

type Props = {
  session: string | null
  identifier_name: string
}

const query = `
query($identifier_name: String!) {
	getAccount(identifier_name: $identifier_name) {
    created_at
    identifier_name
    screen_name
    header_url
    icon_url
    bio
    is_me
  }
  hasFollowRequestSent(target_identifier_name: $identifier_name) {
    id
  }
  isFollowing(target_identifier_name: $identifier_name) {
    id
  }
}
`

const queryFollowRequest = `
mutation($identifier_name: String!) {
	createFollowRequest(target_identifier_name: $identifier_name) {
    id
  }
}
`

type SetState = Dispatch<SetStateAction<JSX.Element>>

class AccountRender {
  setResult: SetState
  identifier_name: string
  hasFollowRequestSent: boolean = false
  followButton: JSX.Element = (<></>)
  followStatus: string = ""
  isFollowing: boolean = false
  account: Account = {
    created_at: "",
    screen_name: "",
    identifier_name: "",
    header_url: "",
    icon_url: "",
    is_me: false
  }

  constructor(identifier_name: string, setResult: SetState) {
    this.setResult = setResult
    this.identifier_name = identifier_name
  }

  AccountTemplate(a: Account) {
    return (
      <>
        <header>
          <Image src={a.header_url} alt="header" width={1024} height={256} />
        </header>
        <article key={a.identifier_name}>
          <Image src={a.icon_url} alt="icon" width={128} height={128} />
          {this.followButton}
          <section>{a.created_at}</section>
          <section>{a.screen_name}</section>
          <section>{a.identifier_name}</section>
        </article>
        {this.followStatus}
        <footer>
          <section>{a.bio}</section>
        </footer>
      </>
    )
  }

  sendFollowRequest = () => {
    ;(async () => {
      this.followStatus = "sending follow request"
      this.render()

      const gql = new GqlClient()
      await gql.fetch({ identifier_name: this.account?.identifier_name }, queryFollowRequest)
      const ret = gql.res.createFollowRequest
      if (!ret || gql.err) {
        this.followStatus = "sending follow request failed"
      } else {
        this.followStatus = "send follow request success"
        this.hasFollowRequestSent = true
      }
      this.render()
    })()
  }

  render() {
    this.renderFollowButton()
    this.setResult(this.AccountTemplate(this.account))
  }

  renderFollowButton() {
    if (this.account.is_me) {
      this.followButton = <>yourself</>
    } else {
      if (this.isFollowing) {
        this.followButton = <>following</>
      } else if (this.hasFollowRequestSent) {
        this.followButton = <>follow request sent</>
      } else {
        this.followButton = <button onClick={this.sendFollowRequest}>follow request</button>
      }
    }
  }

  init() {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ identifier_name: this.identifier_name }, query)
      const a = gql.res?.getAccount as Account | null
      const n = gql.res?.hasFollowRequestSent as Notification | null
      const f = gql.res?.isFollowing as Follow | null
      if (!a || gql.err) {
        this.setResult(a ? gql.err : "account not found")
      } else {
        this.account = a
        if (!this.account.is_me && n) {
          this.hasFollowRequestSent = true
        }
        if (f) {
          this.isFollowing = true
        }
        this.render()
      }
    })()
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  return {
    props: {
      session: ctx.req.cookies["session"] || null,
      identifier_name: ctx.query.account as string
    }
  }
}

const AccountPage: NextPage<Props> = (props: Props) => {
  const [result, setResult] = useState<JSX.Element>(<></>)
  const a = new AccountRender(props.identifier_name, setResult)
  useEffect(() => a.init(), [])

  return (
    <div className={styles.container}>
      <main className={styles.main}>{result}</main>
    </div>
  )
}

export default AccountPage

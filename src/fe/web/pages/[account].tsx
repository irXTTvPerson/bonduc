import type { NextPage, GetServerSideProps } from "next"
import Image from "next/image"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styles from "../styles/Account.module.css"
import { GqlClient } from "../components/common/gql"

type Props = {
  session: string | null
  identifier_name: string
}

type Account = {
  identifier_name: string
  screen_name: string
  created_at: string
  header_url: string
  icon_url: string
  bio: string
  is_me: boolean
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
  getFollowRequest(target_identifier_name: $identifier_name) {
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
type Global = {
  account: Account | null
  followReq: string
  setFolloReq: (v: string) => void
  sentFollowRequest: boolean
}

const g: Global = {
  account: null,
  followReq: "",
  setFolloReq: (v) => {},
  sentFollowRequest: false
}

const toggleFollow = () => {
  ;(async () => {
    g.setFolloReq("sending follow request")
    const gql = new GqlClient()
    await gql.fetch({ identifier_name: g.account?.identifier_name }, queryFollowRequest)
    const ret = gql.res.createFollowRequest
    if (!ret || gql.err) {
      g.setFolloReq("sending follow request failed")
    } else {
      g.setFolloReq("sent follow request")
      g.sentFollowRequest = true
    }
  })()
}

const renderFollowRequestButton = (is_me: boolean) => {
  if (is_me) {
    return "yourself"
  } else {
    if (g.sentFollowRequest) {
      return "follow requested."
    } else {
      return <button onClick={toggleFollow}>follow request</button>
    }
  }
}

const AccountTemplate = (a: Account) => (
  <div className={styles.container}>
    <header>
      <Image src={a.header_url} alt="header" width={1024} height={256} />
    </header>
    <main className={styles.main}>
      <article key={a.identifier_name}>
        <Image src={a.icon_url} alt="icon" width={128} height={128} />
        {renderFollowRequestButton(a.is_me)}
        <section>{a.created_at}</section>
        <section>{a.screen_name}</section>
        <section>{a.identifier_name}</section>
      </article>
      {g.followReq}
    </main>
    <footer>
      <section>{a.bio}</section>
    </footer>
  </div>
)

const getAccount = async (
  identifier_name: string,
  setResult: Dispatch<SetStateAction<string | Account | undefined>>
) => {
  const gql = new GqlClient()
  await gql.fetch({ identifier_name: identifier_name }, query)
  const a = gql.res.getAccount as Account
  if (!a || gql.err) {
    setResult(a ? gql.err : "account not found")
  } else {
    setResult(a)
    g.account = a
    if (!a.is_me && gql.res?.getFollowRequest.length > 0) {
      g.sentFollowRequest = true
    }
  }
}

const renderResult = (res: string | Account | undefined) => {
  if (typeof res === "string") {
    return res
  }
  if (typeof res === "undefined") {
    return `🤔`
  }
  return AccountTemplate(res as Account)
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
  const [result, setResult] = useState<string | Account | undefined>("loading")
  const [follwReq, setFollowReq] = useState("")
  g.followReq = follwReq
  g.setFolloReq = setFollowReq
  useEffect(() => {
    getAccount(props.identifier_name, setResult)
  }, [])

  return <>{renderResult(result)}</>
}

export default AccountPage

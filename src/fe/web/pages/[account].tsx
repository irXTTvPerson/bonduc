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
  }
}
`

const toggleFollow = () => {
}

const AccountTemplate = (a: Account) => (
  <div className={styles.container}>
    <header>
      <Image src={a.header_url} alt="header" width={1024} height={256} />
    </header>
    <main className={styles.main}>
      <article key={a.identifier_name}>
        <Image src={a.icon_url} alt="icon" width={128} height={128} />
        <button onClick={toggleFollow}>follow</button>
        <section>{a.created_at}</section>
        <section>{a.screen_name}</section>
        <section>{a.identifier_name}</section>
      </article>
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
  if (gql.err) {
    setResult(gql.err)
  } else {
    setResult(gql.res.getAccount as Account)
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
  const [result, setResult] = useState<string | Account | undefined>("")
  useEffect(() => {
    getAccount(props.identifier_name, setResult)
  }, [props.identifier_name])

  return (
    <>
      {renderResult(result)}
    </>
  )
}

export default AccountPage

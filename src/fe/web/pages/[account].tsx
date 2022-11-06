import type { NextPage, GetServerSideProps } from "next"
import Image from "next/image"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styles from "../styles/Account.module.css"

type Props = {
  session: string | null
  account: string
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

const AccountTemplate = (a: Account) => (
  <article key={a.identifier_name}>
    <Image src={a.header_url} alt="header" width={1024} height={256} />
    <Image src={a.icon_url} alt="icon" width={128} height={128} />
    <section>{a.created_at}</section>
    <section>{a.screen_name}</section>
    <section>{a.identifier_name}</section>
    <section>{a.bio}</section>
  </article>
)

const getAccount = async (
  identifier_name: string,
  setResult: Dispatch<SetStateAction<string | Account | undefined>>
) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/graphql`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({
        operationName: null,
        variables: {
          identifier_name: identifier_name
        },
        query: query
      })
    })

    if (res.ok) {
      const ret = await res.json()
      if (ret?.errors) {
        setResult(ret.errors[0].message)
      } else {
        if (ret.data.getAccount) {
          setResult(ret.data.getAccount)
        } else {
          setResult("account not found")
        }
      }
    } else {
      setResult("fetch failed")
      console.log(res.statusText)
    }
  } catch (e) {
    setResult(`${e}`)
    console.error(e)
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
      account: ctx.query.account as string
    }
  }
}

const AccountPage: NextPage<Props> = (props: Props) => {
  const [result, setResult] = useState<string | Account | undefined>("")
  useEffect(() => {
    getAccount(props.account, setResult)
  }, [props.account])

  return (
    <div className={styles.container}>
      <main className={styles.main}>{renderResult(result)}</main>
    </div>
  )
}

export default AccountPage

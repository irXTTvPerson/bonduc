import { NextPage, GetServerSideProps } from "next"
import Image from "next/image"
import css from "@/styles/components/timeline.module.css"
import ac from "@/styles/components/account.module.css"

type Props = {
  json: any
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  let json = null
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/atl/top?identifier_name=${ctx.query.identifier_name as string}`, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": ctx.req.headers.cookie!
      },
      method: "GET",
      credentials: "include"
    })
    json = await res.json()
    // console.log(json)
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      json: json
    }
  }
}

const AccountPage: NextPage<Props> = (props: Props) => {
  if (!props.json) {
    return (
      <>
        there is no such an account
      </>
    )
  }

  let pods = []
  for (const pod of props.json.pods) {
    pods.push(
      <article id={pod.id} className={css.article}>
        <Image src={pod.account.icon_uri} alt="icon" width={64} height={64} className={css.icon} />
        <div>
          <div className={css.timestamp}>
            {pod.created_at}
          </div>
          <div>
            {pod.account.screen_name} @{pod.account.identifier_name}
          </div>
          <div className={css.body}>
            {pod.body.body}
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className={ac.container}>
      <header className={ac.header}>
        <div>
          <Image src={props.json.account.header_uri} alt="header" width={1024} height={256} />
        </div>
        <div className={ac.flex}>
          <Image src={props.json.account.icon_uri} alt="icon" width={127} height={128} className={ac.icon} />
          <div>
            {props.json.account.screen_name} @{props.json.account.identifier_name}
          </div>
        </div>
        <div className={ac.bio}>
          {props.json.account.bio}
        </div>
      </header>

      {...pods}
    </div>
  )
}

export default AccountPage
import type { NextPage } from "next"
import { BTLPod, PodVisibility, TimelineType } from "../../../../@types/pod"
import styles from "../../../../styles/HTL.module.css"
import Link from "next/link"
import Image from "next/image"
import { OnSuccess } from "../../control/initializer"
import { GqlClient } from "../../../common/gql"
import { queryGetDecryptedPodBody } from "../../query/pod"
import { useState } from "react"
import { ResultObject } from "../../../../@types/result"
import { Reason } from "../../control/initializer"

type Props = {
  pod: BTLPod
  onSuccess: OnSuccess
}

const toDateString = (date: string) => {
  const d = new Date(date)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

const toIconFromVisibility = (v: PodVisibility) => {
  switch (v) {
    case "anyone":
      return <>β­</>
    case "follower":
      return <>π¨βπ©βπ§βπ¦</>
    case "login":
      return <>π</>
    default:
      return <>γ</>
  }
}

const toIconFromTimelineType = (v: TimelineType) => {
  switch (v) {
    case "home":
      return <>π </>
    case "local":
      return <>π°</>
    case "global":
      return <>π</>
    default:
      return <>γ</>
  }
}

const getDecryptedPod = (props: Props, password: string) => {
  const pod = props.pod
  ;(async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: pod.id, password: password }, queryGetDecryptedPodBody)
    const res = gql.res.getDecryptedPodBody as ResultObject
    if (!res || gql.err) {
      console.error("failed to getDecryptedPodBody")
    } else {
      if (res) {
        props.onSuccess({ id: pod.id, body: res.message as string }, Reason.decryptPod)
      }
    }
  })()
}

const PodElement: NextPage<Props> = (props: Props) => {
  const [password, setPassword] = useState("")
  const pod = props.pod
  const show_form = pod.context.decrypted === false

  let body: JSX.Element
  if (pod.encrypted && show_form) {
    body = (
      <>
        <div>
          <span className={styles.dp_disp}>* γγΉγ―γΌγεΆιγγ€γγ¦γγΎγ *</span>
        </div>
        <div>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => getDecryptedPod(props, password)}>π</button>
        </div>
      </>
    )
  } else {
    body = <span>{pod.body}</span>
  }

  return (
    <span className={styles.article_container_flex_box}>
      <Link href={pod.from.icon_uri} target="_blank">
        <Image src={pod.from.icon_uri} width={48} height={48} alt="icon" />
      </Link>
      <span className={styles.pod_right_container}>
        <span className={styles.pod_right_container_flex_box}>
          <span
            className={`${styles.account_info_name} ${
              pod.mypod ? styles.account_info_thisis_me : ""
            }`}
          >
            <Link href={pod.from.account_unique_uri} target="_blank">
              {pod.from.screen_name}@{pod.from.identifier_name}
            </Link>
          </span>
          <span className={styles.account_info_timestamp}>
            <span className={styles.visibility}>
              {toIconFromVisibility(pod.visibility)}
              {toIconFromTimelineType(pod.timeline_type)}
            </span>
            <Link href={`/pod/${pod.id}`} target="_blank">
              {toDateString(pod.created_at)}
            </Link>
          </span>
        </span>
        {body}
      </span>
    </span>
  )
}

export default PodElement

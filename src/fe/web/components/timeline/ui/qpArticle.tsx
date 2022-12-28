import type { NextPage } from "next"
import PodElement from "./pod/pod"
import { BTLQpPod, BTLPod } from "../../../@types/pod"
import styles from "../../../styles/HTL.module.css"
import { OnSuccess } from "../control/initializer"
import { Popup } from "../htl"
import Link from "next/link"
import { renderFooterButton } from "./podArticle"

type Props = {
  qp: BTLQpPod
  onSuccess: OnSuccess
  popup: Popup
}

const renderQpFrom = (uri: string, name: string) => {
  return (
    <span className={styles.dp_disp}>
      <Link href={uri} target="_blank">
        {name} さんがQPしました ↰
      </Link>
    </span>
  )
}

export const renderQpContent = (
  qp: BTLQpPod,
  onSuccess: OnSuccess,
  popup: Popup,
  isQpInDp: boolean
) => {
  const pod = qp as BTLPod
  const content = qp.pod ?? qp.qp
  const from = (
    <Link className={styles.dp_disp} href={`/pod/${qp.id}`} target="_blank">
      QP from ...
    </Link>
  )

  let quote: JSX.Element
  if (content) {
    if (qp.qp) {
      quote = (
        <>
          {renderQpFrom(qp.qp.from.account_unique_uri, qp.qp.from.screen_name)}
          <PodElement pod={content as BTLPod} onSuccess={onSuccess} />
          <div className={styles.rp_border}>{from}</div>
        </>
      )
    } else {
      quote = <PodElement pod={content as BTLPod} onSuccess={onSuccess} />
    }
  } else {
    if (isQpInDp) {
      quote = from
    } else {
      quote = <span className={styles.dp_disp}>*** the pod was deleted ***</span>
    }
  }
  return (
    <>
      {renderQpFrom(pod.from.account_unique_uri, pod.from.screen_name)}
      <PodElement pod={pod} onSuccess={onSuccess} />
      <div className={styles.rp_border}>{quote}</div>
      {renderFooterButton(pod, "qp", onSuccess, popup)}
    </>
  )
}

const QpArticle: NextPage<Props> = (props: Props) => {
  return (
    <article className={styles.article}>
      {renderQpContent(props.qp, props.onSuccess, props.popup, false)}
    </article>
  )
}

export default QpArticle

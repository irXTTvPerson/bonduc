import type { NextPage } from "next"
import PodElement from "./pod/pod"
import { BTLQpPod } from "../../../@types/pod"
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
        {name}
      </Link>
      さんがQPしました ↰
    </span>
  )
}

const renderQpContent = (qp: BTLQpPod, onSuccess: OnSuccess, popup: Popup) => {
  const pod = qp
  const content = qp.pod ?? qp.qp ?? qp.reply
  const from = <span className={styles.dp_disp}>QP from ...</span>

  let quote: JSX.Element
  if (content) {
    if (qp.qp) {
      quote = (
        <>
          {renderQpFrom(qp.qp.from.account_unique_uri, qp.qp.from.screen_name)}
          <PodElement pod={content} onSuccess={onSuccess} />
          <div className={styles.rp_border}>{from}</div>
        </>
      )
    } else {
      console.log(content)
      quote = <PodElement pod={content} onSuccess={onSuccess} />
    }
  } else {
    quote = <span className={styles.dp_disp}>*** the pod was deleted ***</span>
  }
  return (
    <>
      {renderQpFrom(pod.from.account_unique_uri, pod.from.screen_name)}
      <PodElement pod={pod} onSuccess={onSuccess} />
      {renderFooterButton(pod, onSuccess, popup)}
      <span className={styles.dp_disp}>quote:</span>
      <div className={styles.rp_border}>{quote}</div>
    </>
  )
}

const QpArticle: NextPage<Props> = (props: Props) => {
  return (
    <article className={styles.article}>
      {renderQpContent(props.qp, props.onSuccess, props.popup)}
    </article>
  )
}

export default QpArticle

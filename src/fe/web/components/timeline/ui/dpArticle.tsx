import type { NextPage } from "next"
import PodElement from "./pod/pod"
import { BTLDpPod, BTLQpPod } from "../../../@types/pod"
import styles from "../../../styles/HTL.module.css"
import Link from "next/link"
import { renderPod } from "./podArticle"
import { OnSuccess } from "../control/initializer"
import { Popup } from "../htl"
import { renderFooterButton } from "./podArticle"

type Props = {
  dp: BTLDpPod
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

export const renderQpContent = (qp: BTLQpPod, onSuccess: OnSuccess, popup: Popup) => {
  const pod = qp
  const content = qp.pod ?? qp.qp
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
      quote = <PodElement pod={content} onSuccess={onSuccess} />
    }
  } else {
    quote = from
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

const DpArticle: NextPage<Props> = (props: Props) => {
  const content = props.dp.pod ?? props.dp.qp ?? props.dp.reply
  let quote: JSX.Element
  if (content) {
    if (props.dp.pod || props.dp.reply) {
      quote = renderPod(content, props.onSuccess, props.popup)
    } else {
      quote = renderQpContent(props.dp.qp as BTLQpPod, props.onSuccess, props.popup)
    }
  } else {
    quote = <span className={styles.dp_disp}>*** the pod was deleted ***</span>
  }

  return (
    <article className={styles.article}>
      <span className={styles.dp_disp}>
        <Link href={props.dp.from.account_unique_uri} target="_blank">
          {props.dp.from.screen_name}
        </Link>
        さんがDPしました ⇄
      </span>
      <div className={styles.rp_border}>{quote}</div>
    </article>
  )
}

export default DpArticle

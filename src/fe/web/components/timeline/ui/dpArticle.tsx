import type { NextPage } from "next"
import { BTLDpPod, BTLQpPod, BTLPod } from "../../../@types/pod"
import styles from "../../../styles/HTL.module.css"
import Link from "next/link"
import { renderPod } from "./podArticle"
import { OnSuccess } from "../control/initializer"
import { Popup } from "../htl"
import { renderQpContent } from "./qpArticle"

type Props = {
  dp: BTLDpPod
  onSuccess: OnSuccess
  popup: Popup
}

const DpArticle: NextPage<Props> = (props: Props) => {
  const content = props.dp.pod ?? props.dp.qp
  let quote: JSX.Element
  if (content) {
    if (props.dp.pod) {
      quote = renderPod(content as BTLPod, "pod", props.onSuccess, props.popup)
    } else {
      quote = renderQpContent(props.dp.qp as BTLQpPod, props.onSuccess, props.popup, true)
    }
  } else {
    quote = <span className={styles.dp_disp}>*** the pod was deleted ***</span>
  }

  return (
    <article className={styles.article}>
      <span className={styles.dp_disp}>
        <Link href={props.dp.from.account_unique_uri} target="_blank">
          {props.dp.from.screen_name} さんがDPしました ⇄
        </Link>
      </span>
      <div className={styles.rp_border}>{quote}</div>
    </article>
  )
}

export default DpArticle

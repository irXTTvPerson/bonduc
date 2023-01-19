import type { NextPage } from "next"
import PodElement from "./pod/pod"
import { BTLPod, BTLQpPod, BTLReplyPod } from "../../../@types/pod"
import FavElement from "./footer/fav"
import ReplyElement from "./footer/reply"
import RpElement from "./footer/rp"
import styles from "../../../styles/HTL.module.css"
import { OnSuccess } from "../control/initializer"
import { Popup } from "../htl"

type Props = {
  pod: BTLPod | BTLReplyPod | BTLQpPod
  onSuccess: OnSuccess
  popup: Popup
}

export const renderPod = (
  pod: BTLPod | BTLReplyPod | BTLQpPod,
  onSuccess: OnSuccess,
  popup: Popup
) => {
  return (
    <>
      <PodElement pod={pod} onSuccess={onSuccess} />
      {renderFooterButton(pod, onSuccess, popup)}
    </>
  )
}

export const renderFooterButton = (
  pod: BTLPod | BTLReplyPod | BTLQpPod,
  onSuccess: OnSuccess,
  popup: Popup
) => {
  return (
    <>
      <span className={styles.article_container_flex_box}>
        <ReplyElement pod={pod} onSuccess={onSuccess} popup={popup} />
        <RpElement pod={pod} onSuccess={onSuccess} popup={popup} />
        <FavElement pod={pod} onSuccess={onSuccess} />
      </span>
    </>
  )
}

const PodArticle: NextPage<Props> = (props: Props) => {
  return (
    <article className={styles.article}>
      {renderPod(props.pod, props.onSuccess, props.popup)}
    </article>
  )
}

export default PodArticle
